
class PageLayout extends React.Component {

    constructor(props){
        super(props)
    }

     guid(){
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    render() {
        var clientId = this.guid();
        return (
            <div>
                <QuestionParent clientId={clientId}></QuestionParent>
            </div>

        )
    }
}



{/*
TODO: Limit voting based on localstorage stats. People can vote endlessly as of now.
 */}

 class QuestionParentBase extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            questionList: []
        }

        this.addNewQuestion = this.handleQuestionListAddition.bind(this)
        this.handleVote = this.handleVote.bind(this)

    }

    // Sort by votes
    sortByVotes(list){
        return list.sort( function compare(a, b) {
          if (a.upvotes < b.upvotes)return 1;
          if (a.upvotes > b.upvotes)return -1;
          else{
              if(a.date_created < b.date_created) return -1
              else return 1
          }
        });
    }

    // Additonal questions are always placed at the end
    handleQuestionListAddition(question){


        var currList = this.state.questionList
        var ids = currList.map((q) => q.id)
        if (ids.indexOf(question.id) < 0){
            currList.push(question)
        }
        this.setState({questionList: currList})

    }

    // When A Question is updated, for anything, - we need to re-sort based on vote
    handleQuestionListUpdate(new_q){
        var newState = this.state.questionList.map((old_q) => {
            if(old_q.id == new_q.id) return new_q;
            else return old_q
        });
        // sort list then set state
        var sortedState = this.sortByVotes(newState);
        this.setState({questionList: sortedState})
    }

    // This is only called for local changes - sorting will happen on subscribe updates
    handleQuestionListUpdateAttribute(questionId, attrName, value){
        var newState = this.state.questionList.map((old_q) => {
            if(old_q.id != questionId) return old_q;
            else{
                old_q[attrName] = value;
                return old_q;
            }
        });
        // sort list then set state
        var sortedState = this.sortByVotes(newState);
        this.setState({questionList: sortedState})


    }

     handleQuestionListDeletion(question){
        var newState = this.state.questionList.filter((q)=>{
            return q.id != question.id
        });
        this.setState({questionList:newState})

    }

    componentDidMount(){

        /*
            Subscription to real-time events happen here.
            The model should follow the same event loop as a local change.
            The only difference is that someone else is making the change.
            Always reuse functions and use the same functions for local change
         */

        var channel = _realtime.channels.get('session-'+s_p_k+'-questions');
        channel.subscribe((message) => {
            var data = JSON.parse(message.data)
            if(data.sender_id != this.props.clientId) {
                console.log("receiving message")
                if (message.name == "create") {
                    this.handleQuestionListAddition(data)
                }

                if (message.name == "update") {
                    console.log(data);
                    this.handleQuestionListUpdate(data)
                }
                 if (message.name == "delete") {
                    this.handleQuestionListDeletion(data)
                }
            } else console.log("circular message rejected")

        });

        // Comes ordered by vote from server
        $.ajax({
            url: "/_core/api/session/"+ s_p_k +"/questions/",
            method: "GET",
            dataType: "json"
        }).fail((jqxhr, textstatus) =>
            alert("Sorry couldn't load webpage. Error: " + textstatus)
        ).done((data) => {
            this.setState({questionList:data})
            }
        );

    }

}


{/*
TODO: Limit voting based on localstorage stats. People can vote endlessly as of now.
 */}

class QuestionParent extends QuestionParentBase{

    constructor(props){
        super(props)
    }

    // Only for posting vote data to server and updating state
    handleVote(e, questionId, upvotes, increment){
        var x = upvotes + increment;
        var data = {"upvotes": x, "sender_id": this.props.clientId};
        $.ajax({
            url: "/_core/api/session/"+ s_p_k +"/questions/" + questionId +"/",
            method: "patch",
            dataType: "json",
            data:data
        }).fail((jqxhr, textstatus) =>
            console.log("Vote failed to validate on server.")
        ).done((data) => {
                console.log("Vote saved.")
            }
        );
        // State is updated right away after async server request is *sent* not
        // after it responds
        this.handleQuestionListUpdateAttribute(questionId, "upvotes", x)
    }

    render(){
        return(
            <div>
                <AskQuestion addNewQuestion={this.addNewQuestion} clientId={this.props.clientId}></AskQuestion>
                <hr />
                <Panel questionList={this.state.questionList} handleVote={this.handleVote}  ></Panel>
            </div>
        )
    }
}

class AskQuestion extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            formValues: {
                content: "",
                sender_id: this.props.clientId
            }
        }
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    clearFormValues(){
        this.setState({formValues:{content:""}})
    }

    handleInputChange(event){
        var formvals = this.state.formValues;
        formvals.content = event.target.value;
        this.setState({formValues: formvals});
    }

    handleSubmit(event){

        $.ajax({
            url: "/_core/api/session/"+ s_p_k +"/questions/",
            method: "POST",
            dataType: "json",
            data: this.state.formValues
        }).fail((xhr, textstatus) => {
            console.log(xhr.responseJSON)
            this.setState({errors:xhr.responseJSON})
        }
        ).done((data) =>
            {
                this.clearFormValues()
                this.props.addNewQuestion(data);
                swal("Your question has been sent!", "Success!", "success")

            }

        );
        event.preventDefault();
    }


    render(){
        return(
            <div className="row justify-content-md-center" >
                <div className="col-sm-12 col-md-7">
                    <form onSubmit={(e) => this.handleSubmit(e)}>
                        <div className="form-group">
                          <textarea value={this.state.formValues.content} rows="3" onChange={this.handleInputChange} className="form-control" name="content" id="question" placeholder="Ask anything!"></textarea>
                          <small  className="form-text text-muted">Enter your question above</small>
                        </div>
                        <button type="submit" className="btn btn-primary float-right">Submit</button>
                    </form>
                </div>
            </div>
        )
    }

}




class Panel extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
         const questionItems = this.props.questionList.map((question) =>
            <QuestionSingle question={question} key={question.id} handleVote={this.props.handleVote}></QuestionSingle>
         );
        return(
            <div className = "row justify-content-md-center panel">
                 {questionItems}
            </div>
        )
    }
}






class QuestionSingle extends React.Component{

    /*
        We will store voting usage in local storage, since anonymous users can vote.
        To check whether a user voted, retrieve a value from local storage based on the session pk
        and the question pk in the following format:

        localStorage.getItem("upvote-<session_id>-<question_id> ")
        localStorage.getItem("downvote-<session_id>-<question_id> ")

        TODO:
        We need to make sure that the localStorage doesnt go above a certain size limit.
        Catch exceptions, and clean up localStorage accordingly in the future

    */

    constructor(props){
        super(props);
        this.state = {
            hasUpVoted: (localStorage.getItem("upvote-"+s_p_k +"-"+this.props.question.id))=="true" ? true:false
        }
    }


    /*
        We will eventually need to add logic for signed in users.

        All validation and logic is handled in this local function. The patching to the
        server and the modification to the state is handled by parent component.
     */
    handleVote(event, id, upvotes){
        if(this.state.hasUpVoted != true){
            // Votes have to be above above zero
            if(upvotes + 1 < 0){
                swal("Oops!", "Could not register your vote", "error");
                return false;
            }
            // Change the voting in the state of the parent
            this.props.handleVote(event, id, upvotes, 1);
            localStorage.setItem("upvote-"+s_p_k +"-"+id, true)
            this.setState({hasUpVoted:true})
            swal("Upvote", "Success!", "success")

        } else{
            // Votes have to be above above zero
            if(upvotes - 1 < 0){
                swal("Oops!", "Could not register your vote", "error");
                return false
            }
            // Change the voting in the state of the parent
            this.props.handleVote(event, id, upvotes, -1);
            localStorage.setItem("upvote-"+s_p_k +"-"+id, false)
            this.setState({hasUpVoted:false})
            swal("Downvote", "Success!", "success")
        }

    }

    render(){
        let voteClasses = null;
        if(this.state.hasUpVoted == true){
            voteClasses = "fa fa-chevron-circle-up has-up-voted";
        } else{
            voteClasses = "fa fa-chevron-circle-up";
        }

        let answered = null;
        if(this.props.question.answered){
            answered = <div className="card-footer">Answered</div>
        }
        return(
              <div className="col-sm-12 col-md-10 question-single">
                <div className="card mt-4">
                  <div className="card-body">
                       <div className="voting-container">
                            <span className="num-votes">{this.props.question.upvotes}</span><br/>
                            <i onClick={ (e) => this.handleVote(e, this.props.question.id, this.props.question.upvotes)} className={voteClasses} aria-hidden="true"></i>
                       </div>
                      <div className="content-container">
                            <span className="card-text">
                                {this.props.question.content}
                            </span>
                      </div>

                  </div>
                    {answered}
                </div>
            </div>
        )

    }

}



ReactDOM.render(
  <PageLayout></PageLayout>,
  document.getElementById('react-root')
)
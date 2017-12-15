
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

        this.addNewQuestion = this.handleQuestionListAddition.bind(this);
        this.deleteQuestion = this.handleQuestionListDeletion.bind(this)
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
                if (message.name == "create") {
                    this.handleQuestionListAddition(data)
                }

                if (message.name == "update") {
                    this.handleQuestionListUpdate(data)
                }
                if (message.name == "delete") {
                    this.handleQuestionListDeletion(data)
                }
            } else console.log("circular message rejected")

        });

        // Comes ordered by vote from server
        $.ajax({
            url: "/_core/api/session/"+ s_p_k +"/questions/?answered=false",
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


    render(){
        return(
            <div>
                <Panel questionList={this.state.questionList} deleteQuestion={this.deleteQuestion} clientId={this.props.clientId}></Panel>
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
            <QuestionSingle question={question} key={question.id} deleteQuestion={this.props.deleteQuestion} clientId={this.props.clientId}></QuestionSingle>
         );
        return(
            <div className = "row panel">
                 {questionItems}
            </div>
        )
    }
}






class QuestionSingle extends React.Component{
    constructor(props){
        super(props);
    }


    handleAnswered(event){
        $.ajax({
            url: "/_core/api/session/"+ s_p_k +"/questions/"+this.props.question.id+"/",
            method: "PATCH",
            dataType: "json",
            data:{"answered":true, "sender_id": this.props.clientId}
        }).fail((jqxhr, textstatus) =>
            console.log("Sorry updating this question object. Error: " + textstatus)
        ).done((data) => {
            console.log("Successfully answered!")
        });

        this.props.deleteQuestion(this.props.question)

    }


    handleDelete(event){
        // Delete this question
        $.ajax({
            url: "/_core/api/session/"+ s_p_k +"/questions/"+this.props.question.id+"/",
            method: "DELETE",
            dataType: "json",
            data:{"sender_id": this.props.clientId}
        }).fail((jqxhr, textstatus) =>
            console.log("Sorry delete this question object. Error: " + textstatus)
        ).done((data) => {
            console.log("Successfully deleted object")
        });

        this.props.deleteQuestion(this.props.question)

    }

    render(){
        return(
              <div className="col-sm-6 col-lg-4 question-single">
                <div className="card">
                  <div className="card-body">
                    <h3 className="card-title">
                      {this.props.question.upvotes} <span className="vote-word">Votes</span>
                    </h3>
                    <h6 className="card-text">
                        {this.props.question.content}
                    </h6>
                  </div>
                  {/* make footer its own component eventually - it is too big of a JSX piece */}
                  <div className="card-footer">
                      <div className="row">
                          <div className="col text-center">
                              <div className="icon-container">
                                  <i onClick={(e)=>this.handleAnswered(e)} className="fa fa-check-square-o" aria-hidden="true"></i><br/>
                                  <span className="icon-tags">Answered</span>
                              </div>
                          </div>
                          <div className="col text-center">
                              <div className="icon-container">
                                  <i onClick={(e)=>this.handleDelete(e)} className="fa fa-ban" aria-hidden="true"></i><br />
                                  <span className="icon-tags">Delete</span>
                              </div>
                          </div>

                      </div>
                  </div>
                </div>
              </div>
        )

    }

}

ReactDOM.render(
  <PageLayout></PageLayout>,
  document.getElementById('react-root')
)
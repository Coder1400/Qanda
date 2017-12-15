
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

                if (message.name = "update") {
                    this.handleQuestionListUpdate(data)
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


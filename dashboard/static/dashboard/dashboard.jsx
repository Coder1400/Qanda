class PageLayout extends React.Component {
    render(){
        return (
            <div>
                <br /><br />
                <PageTitle></PageTitle> <br/> <br />
                <EventsList></EventsList>
            </div>
        )
    }
}



function PageTitle(props){
    return (
        <div className="row">
            <div className="col-sm-8">
                <h4>My events</h4>
            </div>
            <div className="col-sm-4 text-right">
                <button type="button" role="button" className="btn btn-outline-success" data-toggle="modal" data-target="#createQandAModal">
                  Create event!
                </button>
            </div>
        </div>
    )
}




class EventsList extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            eventList:[]
        }
        this.addNewEvent = this.handleEventListAddition.bind(this)
    }


    handleEventListAddition(object){
        var currList = this.state.eventList
        currList.push(object);
        this.setState({eventList: currList})


    }

    componentDidMount(){
        $.ajax({
            url: "/_core/api/events",
            method: "GET",
            dataType: "json"
        }).fail((jqxhr, textstatus) =>
            alert("Sorry couldn't load webpage. Error: " + textstatus)
        ).done((data) =>
            this.setState({eventList: data})
        );

    }

    render(){
        const eventItems = this.state.eventList.map((event) =>
            <EventSingle event={event} key={event.id}></EventSingle>
        );
        return (
            <div className="row">

                {/* list of each event object */}
                {eventItems}

                {/* Modal for adding new events */}
                <CreateQandAModal addNewEvent={this.addNewEvent}></CreateQandAModal>
            </div>

        )
    }
}


class EventSingle extends React.Component{
    constructor(props){
        super(props)
    }

    render(){
        return (
            <div className="col-md-6 col-lg-4 event-single">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{this.props.event.name}</h5>
                    <div className="card-text">
                        <span>{this.props.event.passcode}</span>

                    </div>
                  </div>
                  <div className="card-footer">
                      <a href={this.props.event.html_url} className="btn btn-outline-primary">View</a>
                  </div>
                </div>

            </div>

        )
    }

}



class CreateQandAModal extends React.Component{
    constructor(props){
        super(props)
    }

    closeOut(){
        $("#createQandAModal").modal("hide")
    }

    render() {
        return (
            <div className="modal" id="createQandAModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel"
                 aria-hidden="true">
                <div className="modal-dialog modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Create a new QandA event</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <CreateNewQandAForm addNewEvent={this.props.addNewEvent} closeOut={() => this.closeOut()}></CreateNewQandAForm>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


class CreateNewQandAForm extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            formValues: {
                name: "",
                description: "",
                location: "",
                event_type: "",
                start_date: "",
                end_date: "",
                time_zone: "",
                passcode: ""
            },
            errors:{
                name: [],
                description: [],
                location: [],
                event_type: [],
                start_date: [],
                end_date: [],
                time_zone: [],
                passcode: []
            }
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const name = target.id;
        const value = target.value
        const formvalues = this.state.formValues
        formvalues[name] = value
        this.setState({
          formValues: formvalues
        });
    }

    clearFormValues(){
        var values = this.state.formValues;
        for (var k in values) {
            if (values.hasOwnProperty(k)) {
               values[k] = "";
            }
        }
        this.setState({formValues: values})
    }

    clearErrors(){
        var errors = this.state.errors;
        for (var k in errors) {
            if (errors.hasOwnProperty(k)) {
               errors[k] = [];
            }
        }
        this.setState({errors: errors})
    }

    handleSubmit(event){

        this.clearErrors()

        console.log(this.state)
        $.ajax({
            url: "/_core/api/events/",
            method: "POST",
            dataType: "json",
            data: this.state.formValues
        }).fail((xhr, textstatus) => {
            this.setState({errors:xhr.responseJSON})
        }
        ).done((data) =>
            {
                this.props.addNewEvent(data);
                this.props.closeOut()
                this.clearFormValues()
            }

        );
        event.preventDefault();
    }

    render () {
        return (
            <form onSubmit={(e) => this.handleSubmit(e)}>
                <div className="form-group">
                    <label for="name">Name</label>
                    <input value={this.state.formValues.name} onChange={this.handleInputChange} type="text" className="form-control" id="name" aria-describedby="emailHelp" placeholder="Name"/>
                    <span className="error">{this.state.errors.name}</span>
                </div>

                <div className="form-group">
                    <label for="description">Description</label>
                    <input value={this.state.formValues.description} onChange={this.handleInputChange} type="text" className="form-control" id="description" placeholder="Description"/>
                    <span className="error">{this.state.errors.description}</span>
                </div>

                <div className="form-group">
                    <label for="location">Location</label>
                    <input value={this.state.formValues.location} onChange={this.handleInputChange} type="text" className="form-control" id="location" placeholder="location"/>
                    <span className="error">{this.state.errors.location}</span>
                </div>

                <div className="form-group">
                    <label for="event_type">Type of Event</label>
                    <input value={this.state.formValues.event_type} onChange={this.handleInputChange} type="text" className="form-control" id="event_type" placeholder="Type of Event"/>
                    <span className="error">{this.state.errors.event_type}</span>
                </div>

                <div className="form-group">
                    <label for="start_date">Start Date</label>
                    <input value={this.state.formValues.start_date} onChange={this.handleInputChange} type="date" className="form-control" id="start_date" placeholder=""/>
                    <span className="error">{this.state.errors.start_date}</span>
                </div>

                <div className="form-group">
                    <label for="end_date">End Date</label>
                    <input value={this.state.formValues.end_date} onChange={this.handleInputChange} type="date" className="form-control" id="end_date" placeholder=""/>
                    <span className="error">{this.state.errors.end_date}</span>
                </div>

                <div className="form-group">
                    <label for="timezone">Timezone</label>
                    <input value={this.state.formValues.time_zone} onChange={this.handleInputChange} type="text" className="form-control" id="time_zone" placeholder="Time zone"/>
                    <span className="error">{this.state.errors.time_zone}</span>
                </div>

                <div className="form-group">
                    <label for="passcode">Generate Passcode</label>
                    <input value={this.state.formValues.passcode} onChange={this.handleInputChange} type="text" className="form-control" id="passcode" placeholder="Make a passcode"/>
                    <span className="error">{this.state.errors.passcode}</span>
                </div>


                <button type="button" className="btn btn-secondary" onClick={this.props.closeOut}>close</button>
                &nbsp;
                <button type="submit" className="btn btn-primary">Submit</button> &nbsp;
            </form>

        )
    }


}


/* Render the initial component to the screen */

ReactDOM.render(
  <PageLayout></PageLayout>,
  document.getElementById('react-root')
);

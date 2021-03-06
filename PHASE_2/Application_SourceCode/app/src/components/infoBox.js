import React from 'react'
import HospitalGraph from './hospitalGraph'

class InfoBox extends React.Component{

    constructor(props) {
        super(props)

        this.state = {
            casesOrBeds: "cases"
        }

        this.switchGraph = this.switchGraph.bind(this)
    }

    switchGraph(evt) {
        if (evt.target.checked) {
            this.setState({ casesOrBeds: "beds" })
        }
        else {
            this.setState({ casesOrBeds: "cases" })
        }
    }

    displayToggleSwitch() {
        return (
            <label className="switch">
                <input type="checkbox" onChange={this.switchGraph}/>
                <span className="slider round"></span>
            </label>
        )
    }

    render(){
        return(
            <div className="info-box">
                <span id={"close-info-" + this.props.name} className="close-info-box" onClick={this.props.closeInfoDisplayed}> &#x2715; </span>
                <p className="hospital-name"> {this.props.name} </p>
                <hr></hr>
                <div className="hospital-detail">
                    <p> Total beds: <p className="detail-value"> {this.props.totalBeds} </p></p>
                    <p> Beds Available: <p className="detail-value"> {this.props.bedsAvailable} </p></p>
                    {this.props.kitsAvailable !== null ?
                        <p> Total COVID-19 Test Kits Available: <p className="detail-value"> {this.props.kitsAvailable} </p></p>    
                    :
                        null
                    }
                    {this.props.distanceToSuburb
                    ?
                        <p> Distance to home suburb: <p className="detail-value"> {this.props.distanceToSuburb} kms </p> </p>
                    :
                        null
                    }
                    <div className="toggle">
                        <p className="toggle-text"> Predicted Cases </p>
                        {this.displayToggleSwitch()}
                        <p className="toggle-text"> Predicted Beds </p>
                    </div>
                    <HospitalGraph
                        suburb={this.props.suburb}
                        allSuburbCases={this.props.allSuburbCases}
                        totalBeds={this.props.totalBeds}
                        casesOrBeds={this.state.casesOrBeds}
                    />
                </div>
            </div>
        );
    }
}

export default InfoBox
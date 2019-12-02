import React, { Component } from "react";

import moment from "moment";

import "../Stylesheets/Modal.scss";

import AddRide from "./AddRide";
import AddFlight from "./AddFlight";

const ridesURL = "http://localhost:3000/rides/";

class Modal extends Component {
    
    state = {
        datetime: moment(this.props.flight.datetime).format().slice(0, 16) || 
            moment(new Date()).format().slice(0, 16),
    }

    handleClick = () => {
        const { toggleModal, toggleFlight } = this.props;
        toggleFlight();
        toggleModal();
    }

    handleChange = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        
        const { datetime } = this.state;
        const { person, flight, updateRide } = this.props;

        if (flight.ride) {
            const rideParams = {
                ride: {
                    driver_id: person.id,
                    shuttle_attributes: {
                        id: flight.ride.shuttle.id,
                        datetime,
                    }
                }
            }
            const patchURL = `${ridesURL}${flight.ride.id}`;
            const body = JSON.stringify(rideParams);

            fetchCall(patchURL, "PATCH", body)
                .then(parseJSON)
                .then(json => updateRide(flight, json.data.attributes));

            this.handleClick();
        } else if (!flight.ride) {
            const rideParams = {
                ride: {
                    driver_id: person.id,
                    traveler_id: flight.traveler.id,
                    flight_id: flight.id,
                    shuttle_attributes: {
                        datetime,
                    }
                }
            }
            const body = JSON.stringify(rideParams);

            fetchCall(ridesURL, "POST", body)
                .then(parseJSON)
                .then(json => updateRide(flight, json.data.attributes));

            this.handleClick();
        }
    }

    deleteRide = () => {
        const { flight, removeRide } = this.props;
        const deleteURL = `${ridesURL}${flight.ride.id}`

        fetchCall(deleteURL, "DELETE");

        removeRide(flight, flight.ride);

        this.handleClick();
    }

    render() {
        const { datetime } = this.state;

        const { flight, person } = this.props;

        return (
            <section className="modal">
                <div 
                    className="overlay"
                    onClick={ this.handleClick }
                >    
                </div>
                <div className="modal-content">
                    <button 
                        className="close-modal"
                        onClick={ this.handleClick }
                    >X
                    </button>
                    {flight.id
                        ? <AddRide
                            datetime={ datetime }
                            flight={ flight }
                            person={ person }
                            handleChange={ this.handleChange }
                            handleSubmit={ this.handleSubmit }
                            deleteRide={ this.deleteRide }
                        />
                        : <AddFlight
                            datetime={ datetime }
                            person={ person }
                            handleChange={ this.handleChange }
                        />
                    }
                </div>
            </section>
        );
    }
}

function fetchCall(url, method, body) {
    const headers = { "Content-Type": "application/json" }
    return fetch(url, { method, headers, body });
}

function parseJSON(response) {
    return response.json();
}

export default Modal;
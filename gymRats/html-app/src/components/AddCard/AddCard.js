import React from 'react';

import './AddCard.css';

import { IoMdClose } from 'react-icons/io';
import { FaWeight } from 'react-icons/fa';

class AddCard extends React.Component {

    state = {
        notToShowUp: [],
        data: this.props.data
    }

    componentDidMount() {
        let notToShowUp = [];
        for (let card of this.props.data.cards) {
            notToShowUp.push(card.card);
        }
        this.setState({ notToShowUp: notToShowUp });
    }

    openWeightCard = () => {
        this.props.toggleOverlay(false);
        this.props.toggleCardOverlays["weightTracker"](true);
    }

    render() {
        return (
            <div className="add-card-bottom-overlay">
                <div className="add-card-bottom-overlay-topbar">
                    <p className="add-card-bottom-overlay-title">Add card</p>
                    <IoMdClose style={{ fontSize: "1.2rem" }} onClick={() => { this.props.toggleOverlay(false) }} />
                </div>
                <div className="add-card-bottom-overlay-cards">
                    {
                        !this.state.notToShowUp.includes("dailyWeights")
                            ? <div className="add-card-bottom-overlay-card" style={{ backgroundColor: "#3dc7be" }} onClick={() => {
                                this.openWeightCard();
                            }}>
                                <div className="add-card-bottom-overlay-card-topbar">
                                    <FaWeight className="add-card-bottom-overlay-card-icon" />
                                    <p className="add-card-bottom-overlay-card-title">Weight tracker</p>
                                </div>
                            </div>
                            : null
                    }
                </div>
            </div>
        );
    }
}

export default AddCard;

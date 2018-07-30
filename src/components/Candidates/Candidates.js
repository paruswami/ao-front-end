import React, { Component } from 'react';
import './Candidates.css';
import Modal from '../Modal/Modal';
import api from '../../api/routes';
import search from '../../utils/search';

class Candidates extends Component {
    constructor(props) {
        super(props);

        this.state = {
            candidates: null,
            fullCandidates: null,
            modalShown: false,
            search: "",
            searchResult: [],
            searchType: "first_name"
        }

        this.viewCandidate = this.viewCandidate.bind(this);
        this.addCandidate = this.addCandidate.bind(this);
        this.jazzCandidates = this.jazzCandidates.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.candidateToWrapper = this.candidateToWrapper.bind(this);
        this.searchCand = this.searchCand.bind(this);
    }

    componentDidMount() {
        let candidates = [],
            reactKey = 0;

        //Note: Ideally want jazz import to update candidate dashboard on every refresh,
        //but cannot do this right now b/c deleting a candidate takes user back to candidate 
        //dashboard, causing a refresh. This means no candidates can be deleted.
            api.returnCandidates().then((candidateList) => {
                console.log(candidateList);
                this.setState({fullCandidates: candidateList});
                for (let candidate of candidateList) {
                    candidates.push(this.candidateToWrapper(candidate, reactKey));
                    reactKey++;
                }
                this.setState({ candidates: candidates });
                console.log(this.state.fullCandidates);
            });
    }

    candidateToWrapper(candidate, reactKey) {
        return(
            <div key={reactKey} className="candidate-wrapper">
                        <div className="candidate-info">
                            <a onClick={() => { this.viewCandidate(candidate) }}>View</a>
                            <p>{candidate.first_name} {candidate.last_name}</p>
                        </div>
                        <div className="candidate-status">
                            <p>{candidate.title}</p>
                        </div>
                    </div>
        )
    }

    viewCandidate(candidate) {
        this.props.changePage('candidate-profile', candidate);
    }

    addCandidate() {
        this.props.changePage('add-candidate');
    }

    returnModalState(status) {
        console.log(status);
        this.setState({ modalShown: false });
    }

    searchCand(event) {
        let input = event.target.value;
        let output = [];
        let temp = search.candidate({[this.state.searchType]: input},this.state.fullCandidates);
        let reactKey = 0;
        for (let cand in temp){
            output.push(this.candidateToWrapper(temp[cand], reactKey));
            reactKey++;
        }
        this.setState({candidates: output});
    }

    jazzCandidates() {
        console.log(this.state.candidates);
        api.importCandidates().then(() => {
            let candidates = [],
                reactKey = 0;
            api.returnCandidates().then((candidateList) => {
                //console.log(candidateList);
                for (let candidate of candidateList) {
                    candidates.push(this.candidateToWrapper(candidate, reactKey));
                    reactKey++;
                }
                this.setState({ candidates: candidates });
            });
        });
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    }

    render() {
        const modalProps = {
            header: 'Test',
            body: 'This is an alert.',
            modalType: 'prompt'
        };

        return (
            <div className="component-candidates card-background">
                {this.state.modalShown && <Modal modalProps={modalProps} returnModalState={this.returnModalState.bind(this)} />}
                <div className="candidate-header page-card">
                    <label>Search Type:
                        <select name="searchType" onChange={this.handleChange}>
                            {/* <option value="full_name"> Full Name</option> */}
                            <option value="first_name">First Name</option>
                            <option value="last_name">Last Name</option>
                            <option value="title"> Title</option>
                            <option value="email"> Email</option>
                        </select>
                    </label>
                    <input name="search" className="candidate-search" placeholder="Search Candidates" type="search" onKeyUp={this.searchCand}
                        value={this.state.search} onChange={this.handleChange} />
                    <button onClick={this.addCandidate} className="button-primary-blue candidate-add">Add Candidate</button>
                    <button onClick={this.jazzCandidates} className="button-primary-blue refresh">&#10227;</button>
                </div>
                <div className="page-card">
                    {this.state.candidates === null ? <p>Loading...</p> : this.state.candidates}
                </div>
            </div>
        );
    }
}

export default Candidates;

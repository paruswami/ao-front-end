import React, { Component } from 'react';
import './CandidateProfile.css';
import Modal from '../Modal/Modal';
import format from "../../utils/formatter";
import storage from '../../utils/storage';
import api from '../../api/routes';
import * as data from './checklistDescription';

class CandidateProfile extends Component {
    constructor(props) {
        super(props);

        let cand = JSON.parse(JSON.stringify(this.props.currentCandidate));

        cand['new_email'] = cand.email;

        this.state = {
            checklist: {},
            checklistStatus: {},
            profile: cand,
            status: false,
            saveStatus: false, 
            modalShown: false,
            saveModalShown: false,
            show: false,
            data: data,
            selectedTab: "hr"//could be nice feature to make this default to user's department
        };

        this.navigateHome = this.navigateHome.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.buildChecklist = this.buildChecklist.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.removeCandidate = this.removeCandidate.bind(this);
        this.confirm = this.confirm.bind(this);
        this.buildDeptChecklist = this.buildDeptChecklist.bind(this);
        this.selectTab = this.selectTab.bind(this);
        this.handleSalaryChange = this.handleSalaryChange.bind(this);
        this.handlePhoneChange = this.handlePhoneChange.bind(this);
        this.handleOptionChange = this.handleOptionChange.bind(this);

    }


    //the phone ones are kind of the same as the salary ones, try and recycle

    selectTab(event) {
        this.setState({ selectedTab: event.currentTarget.id });
    }

    componentDidMount() {
        const email = this.props.currentCandidate.email;

        this.setState({ isAdmin: storage.returnAdminStatus() });

        api.returnCandidateChecklist(email).then((checklist) => {
            this.setState({
                checklistStatus: JSON.parse(JSON.stringify(checklist))
            }, this.buildChecklist);
        });
    }

    buildChecklist() {
        const checklist = this.state.checklistStatus;
        for (let i in checklist) {
            this.buildDeptChecklist(i);
        }
        console.log("Hello there");
        console.log(this.state.checklist);
        console.log("anayone home?");
        console.log(this.state.profile);
    }

    //overloading buildChecklist to take input
    buildDeptChecklist(deptChecklist) {
        const checklist = this.state.checklistStatus;
        let formedChecklist = [];

        let reactKey = 0;

        if (Object.keys(checklist).length) {
            formedChecklist.push(
                <div key={reactKey}>
                    <h3 className="checklist-header">{deptChecklist}</h3>
                    <ul>
                        {(() => {
                            let checklistItem = [],
                                reactKeyInner = 0;

                            for (let i in checklist[deptChecklist]) {
                                let inputVal = this.state.checklistStatus[deptChecklist][i];

                                checklistItem.push(
                                    <li key={reactKeyInner} onClick={() => { this.handleClick(deptChecklist, i) }}>{this.state.data[deptChecklist][i]}
                                        <div className="checklist-container">
                                            <input readOnly type="checkbox" checked={inputVal} id={reactKey + '-' + reactKeyInner} />
                                            <label htmlFor={reactKey + '-' + reactKeyInner}>
                                                <svg viewBox="0,0,50,50">
                                                    <path d="M5 30 L 20 45 L 40 10"></path>
                                                </svg>
                                            </label>
                                        </div>
                                    </li>
                                );

                                reactKeyInner++;
                            }
                            return checklistItem;
                        })()}
                    </ul>
                </div>
            );
        } else {
            formedChecklist = <div className="page-card"><p>Checklist Info Missing</p></div>;
        }
        let temp = this.state.checklist;
        temp[deptChecklist] = formedChecklist[0];
        this.setState({ checklist: temp });
        return formedChecklist;
    }

/*     formatSalaryToNumber(salary) {

        if(salary===format.salary("-1")){
            return -1;
        } else{
            return parseInt(salary.replace(/[^0-9\.]/g, ''), 10);
        }
    } */


    handleClick(parent, child) {
        let tempChecklist = JSON.parse(JSON.stringify(this.state.checklistStatus));
        tempChecklist[parent][child] = !tempChecklist[parent][child];
        this.setState({ checklistStatus: tempChecklist }, this.buildChecklist);
        let info = {
            email: this.state.profile.email,
            department: parent,
            checklistStep: child,
            check: tempChecklist[parent][child]
        }
        api.switchStatus(info);
    }

    handleChange(event) {
        const { name, value } = event.target;

        let profile = this.state.profile;

        profile[name] = value;
        this.setState({ profile: profile });
    }

    handleOptionChange(event) {
        console.log(event.target);
        const {name, value} = event.target;
        let profile = this.state.profile;
        profile[name]= (value == 'true');
        console.log(profile[name]);
        this.setState({profile: profile});
        console.log("now", this.state.profile.is_remote);
    }

    handleSalaryChange(event){
        console.log(event);
        console.log(event.target);
        const { name, value } = event.target;

        let profile = this.state.profile;
        let output = format.salaryToNumber(value);
        if (!isNaN(output)){
            profile[name] = format.salaryToNumber(value);
        } else {
            profile[name] = -1;
        }
        console.log("this should be fixed...");
        console.log(profile[name]);
        this.setState({ profile: profile });
        console.log(this.state.selectedTab);
    }

    handlePhoneChange(event) {
        console.log(event);
        console.log(event.target);
        const { name, value } = event.target;

        let profile = this.state.profile;
        let output = format.phoneToString(value);
        if (!isNaN(output)){
            profile[name] = format.phoneToString(value);
        } else {
            profile[name] = -1;
        }
        console.log("this should be fixed...");
        console.log(profile[name]);
        this.setState({ profile: profile });
        console.log(this.state.selectedTab);
    }

    navigateHome() {
        this.props.changePage('candidates');
    }

    removeCandidate() {
        let cand = ({ email: this.state.profile.email });
        api.deleteCandidate(cand).then(() => {
            this.navigateHome();
        })
    }

    confirm() {
        this.setState({ modalShown: true });
    }

    updateProfile(event) {
        event.preventDefault();

        if (!this.state.modalShown) {
        const candProfile = JSON.parse(JSON.stringify(this.state.profile));
        //console.log(candProfile)
        api.editCandidate(candProfile).then((response) => {
            console.log(response);
             if (response === "Candidate updated.") {
                 this.setState({ saveModalShown: true });
             }
         });
        console.log(this.state.profile.start_date);
        }
    }

    returnModalState(status) {
        console.log(status);

        this.setState({ status: status });
        console.log(this.state.status);

        this.setState({ modalShown: false });
    }

    returnSaveModalState(saveStatus) {
        console.log(saveStatus);

        this.setState({ saveStatus: saveStatus });
        console.log(this.state.saveStatus);

        this.setState({ saveModalShown: false });
    }

    render() {
        const modalProps = {
            header: 'You are about to delete this candidate!',
            body: 'Are you sure you want to continue?',
            modalType: 'prompt'
        };

        const saveModalProps = {
            header: 'Update ',
            body: 'Your changes have been saved! ',
            modalType: 'alert'
        };

        const profile = this.state.profile,
            isAdmin = this.state.isAdmin;

        return (
            <div className="component-candidate-profile card-background">
                <div className="page-card candidate-profile-section">
                    <h3>Candidate Profile</h3>
                    <form onSubmit={this.updateProfile}>
                        <input type="checkbox" className="read-more-state" id="post-2" />
                        <ul className="read-more-wrap">
                            <fieldset className="split-column">
                                <label>First Name*:
                                <input readOnly={!isAdmin} name="first_name" type="string" value={profile.first_name} onChange={this.handleChange} />
                                </label>
                                <label>Last Name*:
                                <input readOnly={!isAdmin} name="last_name" type="string" value={profile.last_name} onChange={this.handleChange} />
                                </label>
                            </fieldset>
                            <fieldset className="split-column">
                                <label>Job Title*:
                                <input readOnly={!isAdmin} name="title" type="text" value={profile.title} onChange={this.handleChange} />
                                </label>
                                <label>Start Date:
                                <input readOnly={!isAdmin} name="start_date" type="date" value={format.date(profile.start_date)} onChange={this.handleChange} />
                                </label>
                            </fieldset>

                            {/* SHOW MORE */}
                            <fieldset className="read-more-target">

                                <fieldset className="split-column">
                                    <label>Phone Primary*:
                                <input readOnly={!isAdmin} name="phone_primary" type="text" value={format.phone(profile.phone_primary)} onChange={this.handlePhoneChange} />
                                    </label>
                                    <label>Email*:
                                <input readOnly={!isAdmin} name="new_email" type="text" value={profile.new_email} onChange={this.handleChange} />
                                    </label>
                                </fieldset>
                                <fieldset className="split-column">
                                    <label>Phone Secondary:
                                <input readOnly={!isAdmin} name="phone_secondary" type="text" value={format.phone(profile.phone_secondary)} onChange={this.handlePhoneChange} />
                                    </label>
                                    <label>Jazz ID:
                                <input readOnly={!isAdmin} name="applicant_id" type="text" value={profile.applicant_id} onChange={this.handleChange} />
                                    </label>
                                </fieldset>
                                {isAdmin &&
                                    <fieldset className="split-column">
                                        <label>Salary Initial:
                                <input readOnly={!isAdmin} name="salary_offer_initial" type="text" value={format.salary(profile.salary_offer_initial)} onChange={this.handleSalaryChange} />
                                        </label>
                                        <label>Salary Final:
                                <input readOnly={!isAdmin} name="salary_offer_final" type="text" value={format.salary(profile.salary_offer_final)} onChange={this.handleSalaryChange} />
                                        </label>
                                    </fieldset>
                                }
                                <label htmlFor="is_remote"> Is Remote:</label>
                                <div id="checkboxes">
                                        <div className="checkboxgroup">
                                            <label htmlFor="true">Yes</label>
                                            <input type="radio" name="is_remote" value="true" 
                                            checked={profile.is_remote === true}
                                            onChange={this.handleOptionChange}/>
                                        </div>
                                        <div className="checkboxgroup">
                                            <label htmlFor="false">No</label>
                                            <input type="radio" name="is_remote" value="false" 
                                            checked={profile.is_remote === false}
                                            onChange={this.handleOptionChange}/>
                                        </div>
                                    </div>
                                <label htmlFor="offer_negotiated"> Offer Negotiated:</label>
                                    <div id="checkboxes">
                                        <div className="checkboxgroup">
                                            <label htmlFor="true">Yes</label>
                                            <input type="radio" name="offer_negotiated" value="true" 
                                            checked={profile.offer_negotiated === true}
                                            onChange={this.handleOptionChange}/>
                                        </div>
                                        <div className="checkboxgroup">
                                            <label htmlFor="false">No</label>
                                            <input type="radio" name="offer_negotiated" value="false" 
                                            checked={profile.offer_negotiated === false}
                                            onChange={this.handleOptionChange}/>
                                        </div>
                                    </div>
                                    <label htmlFor="offer_accepted"> Offer Accepted:</label>
                                    <div id="checkboxes">
                                        <div className="checkboxgroup">
                                            <label htmlFor="true">Yes</label>
                                            <input type="radio" name="offer_accepted" value="true" 
                                            checked={profile.offer_accepted === true}
                                            onChange={this.handleOptionChange}/>
                                        </div>
                                        <div className="checkboxgroup">
                                            <label htmlFor="false">No</label>
                                            <input type="radio" name="offer_accepted" value="false" 
                                            checked={profile.offer_accepted === false}
                                            onChange={this.handleOptionChange}/>
                                        </div>
                                    </div>
                            </fieldset>
                        </ul>
                        <label htmlFor="post-2" className="read-more-trigger"></label>
                        {isAdmin &&
                            <div className="button-wrapper">
                                <button className="button-primary-blue">Save Changes</button>
                                <button onClick={this.confirm} className="button-primary-danger">Delete Candidate</button>
                            </div>
                        }
                        
                    </form>
                    <div>
                    {this.state.modalShown && <Modal modalProps={modalProps} returnModalState={this.returnModalState.bind(this)} />}
                    {this.state.status &&
                        this.removeCandidate()
                    }
                    </div>
                    {this.state.saveModalShown && <Modal modalProps={saveModalProps} returnModalState={this.returnSaveModalState.bind(this)} />}
                    
                </div>
                {this.state.checklist === null ? <div className="page-card"><p>Loading...</p></div> :
                    <div className="page-card checklist-section">
                        <div class="tab">
                            <button className="button-secondary-blue" id="hr" onClick={this.selectTab}>HR</button>
                            <button className="button-secondary-blue" id="it" onClick={this.selectTab}>IT</button>
                            <button className="button-secondary-blue" id="office" onClick={this.selectTab}>Office Management</button>
                            <button className="button-secondary-blue" id="operations" onClick={this.selectTab}>Operations</button>
                            <button className="button-secondary-blue" id="recruiting" onClick={this.selectTab}>Recruiting</button>
                            <button className="button-secondary-blue" id="training" onClick={this.selectTab}>Training</button>
                        </div>

                        {(() => {
                            let tab = this.state.selectedTab;
                            return this.state.checklist[tab];
                        })()}
                    </div>}


                <div className='sticky-footer'>
                    <button onClick={this.navigateHome} className="button-primary-pink">Return</button>
                </div>
            </div>

        );
    }
}

export default CandidateProfile;
import call from './calls';

export default {
    pingAuth: () => {
        const endpoint = 'ping-auth';

        return new Promise((resolve) => {
            call.post(endpoint).then((response) => {
                resolve(response);
            });
        });
    },
    
    returnCandidates: () => {
        const endpoint = 'return-candidates';

        let candidates = [];

        return new Promise((resolve) => {
            call.post(endpoint).then((candidateList) => {
                try {
                    if (Array.isArray(candidateList)) {
                        candidates = JSON.parse(JSON.stringify(candidateList));
                    } else {
                        candidates = [];
                    }
                } catch (err) {
                    candidates = [];
                } finally {
                    resolve(candidates);
                }
            });
        });
    },

    returnCandidateChecklist: (email, department = '') => {
        const endpoint = 'return-checklist',
            payload = {
                email: email,
                department: department
            };

        return new Promise((resolve) => {
            call.post(endpoint, payload).then((response) => {
                resolve(response);
            });
        });
    },

    createNewCandidate: (candidateInformation) => {
        const endpoint = 'create-candidate';

        return new Promise((resolve) => {
            call.post(endpoint, candidateInformation).then((response) => {
                resolve(response);
            });
        });
    },

    editCandidate: (candidateProfile) => {
        const endpoint = 'edit-candidate';

        return new Promise((resolve) => {
            call.post(endpoint, candidateProfile).then((response) => {
                resolve(response);
            });
        });
    },

    importCandidates: () => {
        const endpoint = 'import-candidates';

        return new Promise((resolve) => {
            call.post(endpoint).then((response) => {
                resolve(response)
            });
        });
    },
    
    deleteCandidate: (cand) => {
        const endpoint = 'delete-candidate';

        return new Promise((resolve) => {
            call.post(endpoint, cand).then((response) => {
                resolve(response);
            });
        });
    },

    searchCandidate: (search) => {
        const endpoint = 'search-candidate';

        return new Promise((resolve) => {
            call.post(endpoint, search).then((response) => {
                resolve(response);
            });
        });
    },

    switchStatus: (info) => {
        const endpoint = "switch-status";
        
        return new Promise((resolve) => {
            call.post(endpoint, info).then((response) => {
                resolve(response);
            });
        });
    }

/*     alterChecklist: (db, email, departmentChecklist, checklistStep, check)
 */
    

}

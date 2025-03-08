document.addEventListener('DOMContentLoaded', async () => {
    const motifHospitalisation = document.getElementById('motif-hospitalisation');
    const activitePhysique = document.getElementById('activite-physique');
    const tabac = document.getElementById('tabac');
    const alcool = document.getElementById('alcool');
    const alimentation = document.getElementById('alimentation');
    const emploi = document.getElementById('emploi');
    const antecedentsMedicaux = document.getElementById('antecedents-medicaux');
    const antecedentsChirurgicaux = document.getElementById('antecedents-chirurgicaux');
    const antecedentsFamiliaux = document.getElementById('antecedents-familiaux');
    const traitementsListe = document.getElementById('traitements-liste');
    const allergiesListe = document.getElementById('allergies-liste');
    const debutSymptomes = document.getElementById('debut-symptomes');
    const evolution = document.getElementById('evolution');
    const facteursDeclenchants = document.getElementById('facteurs-declenchants');
    const symptomesAssocies = document.getElementById('symptomes-associes');
    const  remarques = document.getElementById(' remarques');
    const tension = document.getElementById('tension');
    const pouls = document.getElementById('pouls');
    const temperature = document.getElementById('temperature');
    const saturationO2 = document.getElementById('saturationO2');
    const frequenceRespiratoire = document.getElementById('frequenceRespiratoire');
    const aspectGeneral = document.getElementById('aspectGeneral');
    const examenCardiovasculaire = document.getElementById('examenCardiovasculaire');
    const examenPulmonaire = document.getElementById('examenPulmonaire');
    const examenAbdominal = document.getElementById('examenAbdominal');
    const examenNeurologique = document.getElementById('examenNeurologique');
    const availableExams = document.getElementById('availableExams');
    const examensResults = document.getElementById('examens-results');
    console.log('examensResults défini au début :', examensResults);
    const diagnosticInput = document.getElementById('diagnostic-input');
    const validateDiagnosticButton = document.getElementById('validate-diagnostic');
    const scoreDisplay = document.getElementById('score');
    const feedbackDisplay = document.getElementById('feedback');
    const nextCaseButton = document.getElementById('next-case');

    let cases = [];
    let currentCaseIndex = 0;
    let currentCase = null;
    let score = 0;

    const examCategories = {
        "Examens sanguins": ["NFS", "Ionogramme", "Bilan hépatique", "Bilan rénal", "CRP", "Procalcitonine"],
        "Imagerie": ["Radiographie pulmonaire", "Echographie abdominale", "Scanner cérébral", "IRM médullaire", "Radiographie thoracique"],
        "Tests fonctionnels": ["ECG", "EFR", "Test d'effort"],
        "Examens microbiologiques": ["Hémocultures", "ECBU", "Coproculture", "Antibiogramme"]
    };

    async function loadCasesData() {
        try {
            // Récupérer les thèmes sélectionnés depuis localStorage
            const selectedThemes = JSON.parse(localStorage.getItem('selectedThemes')) || [];
            if (selectedThemes.length === 0) {
                throw new Error('Aucun thème sélectionné');
            }
    
            // Charger l’index des cas
            const response = await fetch('data/case-index.json');
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const caseIndex = await response.json();
    
            // Filtrer les fichiers pour les thèmes sélectionnés (insensible à la casse)
            let caseFiles = [];
            console.log('Selected themes:', selectedThemes);
            selectedThemes.forEach(theme => {
                const themeLower = theme.toLowerCase(); // Convertir en minuscules
                if (caseIndex[themeLower]) {
                    caseFiles = caseFiles.concat(caseIndex[themeLower]);
                }
            });
            console.log('Case files found:', caseFiles);
    
            if (caseFiles.length === 0) {
                throw new Error('Aucun cas disponible pour les thèmes sélectionnés');
            }
    
            // Charger les données de chaque fichier
            const casesPromises = caseFiles.map(file =>
                fetch(`data/${file}`)
                    .then(res => {
                        if (!res.ok) throw new Error(`Fichier ${file} introuvable`);
                        return res.json();
                    })
            );
            const cases = await Promise.all(casesPromises);
            console.log('Cas chargés :', cases);
            return cases;
        } catch (error) {
            console.error('Erreur lors du chargement des cas :', error);
            alert('Erreur lors du chargement des cas cliniques : ' + error.message);
            return [];
        }
    }

    function displayValue(element, value) {
        console.log("Checking element availability:", element);
        element.textContent = value;
    }

    function loadCase() {
        if (cases.length === 0) {
            alert('Aucun cas clinique trouvé.');
            return;
        }
    
        // Sélection aléatoire d’un cas
        currentCaseIndex = Math.floor(Math.random() * cases.length);
        currentCase = cases[currentCaseIndex];

        displayValue(document.getElementById('patient-nom'), currentCase.patient.nom);
        displayValue(document.getElementById('patient-prenom'), currentCase.patient.prenom);
        displayValue(document.getElementById('patient-age'), currentCase.patient.age);
        displayValue(document.getElementById('patient-sexe'), currentCase.patient.sexe);
        displayValue(document.getElementById('patient-taille'), currentCase.patient.taille);
        displayValue(document.getElementById('patient-poids'), currentCase.patient.poids);
        displayValue(document.getElementById('patient-groupeSanguin'), currentCase.patient.groupeSanguin);
        displayValue(motifHospitalisation, currentCase.interrogatoire.motifHospitalisation);
        displayValue(activitePhysique, currentCase.interrogatoire.modeDeVie.activitePhysique.description);
        displayValue(tabac, `${currentCase.interrogatoire.modeDeVie.tabac.quantite} depuis ${currentCase.interrogatoire.modeDeVie.tabac.duree}`);
        displayValue(alcool, currentCase.interrogatoire.modeDeVie.alcool.quantite);
        displayValue(alimentation, `${currentCase.interrogatoire.modeDeVie.alimentation.regime}, ${currentCase.interrogatoire.modeDeVie.alimentation.particularites}`);
        displayValue(emploi, `${currentCase.interrogatoire.modeDeVie.emploi.profession}, stress: ${currentCase.interrogatoire.modeDeVie.emploi.stress}`);
        antecedentsMedicaux.innerHTML = '<ul>' + currentCase.interrogatoire.antecedents.medicaux.map(ant => `<li>${ant.type} (${ant.traitement})</li>`).join('') + '</ul>';
        antecedentsChirurgicaux.innerHTML = '<ul>' + currentCase.interrogatoire.antecedents.chirurgicaux.map(ant => `<li>${ant.intervention} (${ant.date})</li>`).join('') + '</ul>';
        antecedentsFamiliaux.innerHTML = '<ul>' + currentCase.interrogatoire.antecedents.familiaux.map(ant => `<li>${ant.lien}: ${ant.pathologie} (${ant.age} ans)</li>`).join('') + '</ul>';
        traitementsListe.textContent = currentCase.interrogatoire.traitements.map(trait => `${trait.nom} ${trait.dose} (${trait.frequence})`).join(', ');
        allergiesListe.textContent = currentCase.interrogatoire.allergies.presence ? currentCase.interrogatoire.allergies.liste.map(allergie => `${allergie.allergene} (${allergie.reaction})`).join(', ') : 'Aucune';
        displayValue(debutSymptomes, currentCase.interrogatoire.histoireMaladie.debutSymptomes);
        displayValue(evolution, currentCase.interrogatoire.histoireMaladie.evolution);
        displayValue(facteursDeclenchants, currentCase.interrogatoire.histoireMaladie.facteursDeclenchants);
        displayValue(symptomesAssocies, currentCase.interrogatoire.histoireMaladie.symptomesAssocies.join(', '));
        displayValue( remarques, currentCase.interrogatoire.histoireMaladie. remarques);
        displayValue(tension, currentCase.examenClinique.constantes.tension);
        displayValue(pouls, currentCase.examenClinique.constantes.pouls);
        displayValue(temperature, currentCase.examenClinique.constantes.temperature);
        displayValue(saturationO2, currentCase.examenClinique.constantes.saturationO2);
        displayValue(frequenceRespiratoire, currentCase.examenClinique.constantes.frequenceRespiratoire);
        displayValue(aspectGeneral, currentCase.examenClinique.aspectGeneral);
        displayValue(examenCardiovasculaire, currentCase.examenClinique.examenCardiovasculaire.auscultation);
        displayValue(examenPulmonaire, currentCase.examenClinique.examenPulmonaire.auscultation);
        displayValue(examenAbdominal, currentCase.examenClinique.examenAbdominal.palpation);
        displayValue(examenNeurologique, currentCase.examenClinique.examenNeurologique.conscience);

        availableExams.innerHTML = '';
        examensResults.innerHTML = '';

        // Afficher les examens disponibles sous forme de boutons
        const availableExamsTitle = document.createElement('h3');
        availableExamsTitle.textContent = "Examens disponibles";
        availableExams.appendChild(availableExamsTitle);

        currentCase.availableExams.forEach(examen => {
            const button = document.createElement('button');
            button.textContent = examen;
            button.dataset.examen = examen;
            button.addEventListener('click', handleExamenClick);
            availableExams.appendChild(button);
        });

        diagnosticInput.value = '';
        scoreDisplay.textContent = '';
        feedbackDisplay.textContent = '';
        score = 0;
    }

    function handleExamenClick(event) {
        const examen = event.target.dataset.examen;

        const result = currentCase.examResults[examen] || "Résultat non disponible";
        alert(`${examen}: ${typeof result === 'object' ? JSON.stringify(result) : result}`);
    }

    document.getElementById('validate-exams').addEventListener('click', () => {
        let selectedExams = [];
        for (const category in examCategories) {
            const selectId = `select-${category.replace(/\s+/g, '-').toLowerCase()}`;
            const selectElement = document.getElementById(selectId);
            if (selectElement) {
                const selectedOptions = Array.from(selectElement.selectedOptions);
                selectedExams = selectedExams.concat(selectedOptions.map(option => option.value));
            }
        }

        console.log("Examens sélectionnés:", selectedExams);

         
    });

    function handleShowResultClick(event) {
       const examen = event.target.dataset.examen;
        // Simuler un délai avant d'afficher le résultat
        setTimeout(() => {
            const result = currentCase.examResults[examen] || "Résultat non disponible";
            const resultDiv = document.createElement('div');
            resultDiv.innerHTML = `<strong>${examen}:</strong> ${typeof result === 'object' ? JSON.stringify(result) : result}`;
            examensResults.appendChild(resultDiv);
        }, 1000); // Délai de 1 seconde
    }

    validateDiagnosticButton.addEventListener('click', () => {
    const userDiagnostic = diagnosticInput.value.trim();
    const correctDiagnostic = currentCase.correctDiagnostic;
    let feedback = currentCase.feedback[userDiagnostic] || "Diagnostic incorrect. Veuillez réessayer.";

    let diagnosticScore = 0;
    if (userDiagnostic.toLowerCase() === correctDiagnostic.toLowerCase()) {
        diagnosticScore = currentCase.scoringRules.correctDiagnostic || 0;
        feedback = currentCase.feedback[userDiagnostic] || "Diagnostic correct.";
    } else if (isSimilarDiagnostic(userDiagnostic, correctDiagnostic)) {
        diagnosticScore = (currentCase.scoringRules.correctDiagnostic || 0) / 2; // Score partiel
        feedback = "Diagnostic partiellement correct. Veuillez affiner votre diagnostic.";
    }

    feedbackDisplay.textContent = feedback;

    // Déduction du coût des examens
    let examCost = 0;
    const examCategoryCosts = {
        "Examens sanguins": 10,
        "Imagerie": 20,
        "Tests fonctionnels": 15,
        "Examens microbiologiques": 25
    };

    let selectedExamsCost = 0;
    for (const category in examCategories) {
        const selectId = `select-${category.replace(/\s+/g, '-').toLowerCase()}`;
        const selectElement = document.getElementById(selectId);
        if (selectElement) {
            const selectedOptions = Array.from(selectElement.selectedOptions);
            if (selectedOptions.length > 0) {
                selectedExamsCost += examCategoryCosts[category] || 0;
            }
        }
    }

    score = diagnosticScore - selectedExamsCost;
    scoreDisplay.textContent = `Score: ${score.toFixed(2)}`;
});

function isSimilarDiagnostic(userDiagnostic, correctDiagnostic) {
    // Implémentation simplifiée de la comparaison des diagnostics
    const userKeywords = userDiagnostic.toLowerCase().split(' ');
    const correctKeywords = correctDiagnostic.toLowerCase().split(' ');
    let commonKeywords = userKeywords.filter(keyword => correctKeywords.includes(keyword));
    return commonKeywords.length > 0;
}

    nextCaseButton.addEventListener('click', () => {
        currentCaseIndex = (currentCaseIndex + 1) % cases.length;
        loadCase();
    });

    async function initializeGame() {
        cases = await loadCasesData();
        if (cases.length > 0) {
            loadCase();
        }
    }
    
    examensResults.innerHTML = '';
    initializeGame();
});

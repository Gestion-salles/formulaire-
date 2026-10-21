/* ==========================================================
   SERVEUR NODE.JS (avec Express)
   Il fait deux choses :
   1) il affiche la page web (le dossier "public")
   2) il fournit une API : /api/filieres
        - GET  : renvoie la liste des filières enregistrées
        - POST : enregistre une nouvelle filière
   Les filières sont gardées dans le fichier filieres.json
   ========================================================== */

// ----- On importe les outils dont on a besoin -----
const express = require('express');   // Express : facilite la création d'un serveur
const fs = require('fs');             // fs : lire et écrire des fichiers
const path = require('path');         // path : construire des chemins de fichiers

const app = express();                // on crée l'application
const PORT = 3000;                    // le serveur sera accessible sur http://localhost:3000
const FICHIER = path.join(__dirname, 'filieres.json');   // le fichier qui garde les filières


// ----- Réglages -----
app.use(express.json());   // permet de lire le JSON envoyé par fetch (dans req.body)
app.use(express.static(path.join(__dirname, 'public')));   // affiche index.html, index.css, index.js


// ----- Deux petites fonctions pour lire et écrire le fichier JSON -----
function lireFilieres() {
    const texte = fs.readFileSync(FICHIER, 'utf8');   // lit le contenu du fichier (du texte)
    return JSON.parse(texte);                         // transforme le texte JSON en tableau JavaScript
}

function ecrireFilieres(liste) {
    // JSON.stringify transforme le tableau en texte JSON ; (liste, null, 2) = avec une belle mise en page
    fs.writeFileSync(FICHIER, JSON.stringify(liste, null, 2));
}


// ----- GET : renvoyer la liste des filières -----
// req = la demande reçue, res = la réponse qu'on renvoie
app.get('/api/filieres', (req, res) => {
    res.json(lireFilieres());
});


// ----- POST : enregistrer une filière -----
app.post('/api/filieres', (req, res) => {

    // Les données envoyées par fetch se trouvent dans req.body
    const donnees = req.body || {};
    const nom = donnees.nom;
    const effectif = donnees.effectif;
    const categorie = donnees.categorie;

    // Listes autorisées
    const filieres = ['DA', 'SI', 'SRI', 'II', 'CCA', 'CI', 'GM', 'GC', 'TPL', 'Droit'];
    const categories = ['informatique', 'non_informatique'];

    // Validation côté serveur : on revérifie, car le JavaScript de la page peut être contourné.
    // Code 400 = données invalides
    if (!filieres.includes(nom) || !Number.isInteger(effectif) || effectif < 1 || !categories.includes(categorie)) {
        return res.status(400).json({ message: 'Données invalides : vérifiez le formulaire.' });
    }

    const liste = lireFilieres();

    // Une filière ne peut pas être enregistrée deux fois. Code 409 = conflit (existe déjà)
    const existeDeja = liste.some((f) => f.nom === nom);
    if (existeDeja) {
        return res.status(409).json({ message: 'Cette filière existe déjà.' });
    }

    // On ajoute la nouvelle filière à la liste, avec un numéro (id)
    const nouvelleFiliere = {
        id: liste.length + 1,
        nom: nom,
        effectif: effectif,
        categorie: categorie
    };
    liste.push(nouvelleFiliere);
    ecrireFilieres(liste);   // on sauvegarde dans filieres.json

    // Code 201 = créé avec succès
    res.status(201).json({ message: 'La filière ' + nom + ' a été enregistrée.' });
});


// ----- Démarrage du serveur -----
app.listen(PORT, () => {
    console.log('Serveur lancé : http://localhost:' + PORT);
});

/* ==========================================================
   FICHIER JAVASCRIPT (côté navigateur)
   Il fait trois choses :
   1) afficher ou cacher le formulaire
   2) vérifier que les champs sont bien remplis (validation)
   3) envoyer les données à l'API du serveur Node.js avec fetch
   ========================================================== */


// ----- On retrouve les éléments de la page grâce à leur id -----
const bouton = document.querySelector('#ouvrir');          // le bouton « Ajouter une filière »
const formulaire = document.querySelector('#formulaire');  // le formulaire
const message = document.querySelector('#message');        // le message sous le bouton Enregistrer


// ----- 1) Un clic sur le bouton affiche ou cache le formulaire -----
// toggle('active') : ajoute la classe "active" si elle n'y est pas, la retire sinon.
// Le CSS affiche le formulaire quand il a la classe "active".
bouton.addEventListener('click', () => {
    formulaire.classList.toggle('active');
});


// ----- 2) Quand on clique sur « Enregistrer » -----
// "async" nous permet d'utiliser "await" plus bas : attendre la réponse du serveur
formulaire.addEventListener('submit', async (event) => {

    // Empêche la page de se recharger (comportement normal d'un formulaire)
    event.preventDefault();

    // On lit ce que l'utilisateur a choisi ou écrit (.value = la valeur du champ)
    const nom = document.querySelector('#nom').value;
    const effectif = document.querySelector('#effectif').value;
    const categorie = document.querySelector('#categorie').value;

    // On efface les anciens messages (un texte vide = rien à afficher)
    document.querySelector('#erreur-nom').textContent = '';
    document.querySelector('#erreur-effectif').textContent = '';
    document.querySelector('#erreur-categorie').textContent = '';
    message.textContent = '';

    // ----- VALIDATION : on vérifie chaque champ -----
    let tout_est_bon = true;   // on suppose que tout est bon, puis on change si on trouve une erreur

    if (nom === '') {   // === veut dire « est exactement égal à » ; '' = rien n'a été choisi
        document.querySelector('#erreur-nom').textContent = 'Veuillez choisir une filière.';
        tout_est_bon = false;
    }

    if (effectif < 1) {   // champ vide, 0 ou nombre négatif
        document.querySelector('#erreur-effectif').textContent = 'Veuillez entrer un effectif (1 ou plus).';
        tout_est_bon = false;
    }

    if (categorie === '') {
        document.querySelector('#erreur-categorie').textContent = 'Veuillez choisir une catégorie.';
        tout_est_bon = false;
    }

    // S'il y a au moins une erreur, on s'arrête ici : rien n'est envoyé
    if (tout_est_bon === false) {
        return;
    }

    // ----- 3) ENVOI avec fetch -----
    // Les données à envoyer, rangées dans un objet (clé : valeur)
    const donnees = {
        nom: nom,
        effectif: Number(effectif),   // Number() transforme le texte "35" en nombre 35
        categorie: categorie
    };

    // try / catch : on essaie d'envoyer ; en cas de problème (serveur éteint...), on passe dans catch
    try {
        // fetch envoie les données à l'API de notre serveur Node.js.
        // await = on attend la réponse du serveur avant de passer à la ligne suivante
        const reponse = await fetch('/api/filieres', {
            method: 'POST',                                      // POST = on envoie des données
            headers: { 'Content-Type': 'application/json' },     // on précise que c'est du JSON
            body: JSON.stringify(donnees)                        // transforme les données en texte JSON
        });

        // Le serveur répond aussi en JSON : on le lit
        const resultat = await reponse.json();

        // reponse.ok vaut true si l'enregistrement a réussi (codes 200 à 299)
        if (reponse.ok) {
            message.textContent = resultat.message;   // ex. « La filière DA a été enregistrée. »
            message.className = 'message succes';    // message en vert
            formulaire.reset();                       // vide le formulaire
        } else {
            message.textContent = resultat.message;   // ex. « Cette filière existe déjà. »
            message.className = 'message echec';     // message en rouge
        }
    } catch (erreur) {
        // Le serveur ne répond pas (il n'est peut-être pas démarré)
        message.textContent = 'Impossible de contacter le serveur.';
        message.className = 'message echec';
    }
});

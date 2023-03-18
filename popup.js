// Déclarer une variable globale pour stocker le caractère d'attente
var waitChar = " ";
var reponseGPT = "";
var onAfficheReponse = false;
var enEcriture = false;

function toggleWaitChar() {
  if (waitChar === "▮") {
    waitChar = " ";
    setTimeout(toggleWaitChar, 250);
  }
  else {
    waitChar = "▮";
    setTimeout(toggleWaitChar, 750);
  }
  if (enEcriture) document.getElementById("outputGPT").value = reponseGPT + waitChar;
}


function afficherReponse(){
    document.getElementById("requete").style.display = "none";  //
    document.getElementById("resultat").style.display = "inline"; //
    onAfficheReponse = true;
}
function onEcrit(i) {
    enEcriture = i;
    if (i) {    // si on écrit
        document.getElementById("arreter").style.display = "inline";  //on affiche le bouton arrêter
    } else {
        document.getElementById("arreter").style.display = "none";  // on le masque
    }
    
}

document.addEventListener("DOMContentLoaded", (event) => {  // quand la page a fini de charger, on ajoute la fonction click aux boutons, et on gère le chargement du cookie
    var prompt = document.cookie.split(';')[0].split('=')[1];
    document.getElementById("prompt").value = (decodeURIComponent(prompt) == "undefined") ? "" : decodeURIComponent(prompt);
    toggleWaitChar();
    onEcrit(false);
    document.getElementById("bouton").addEventListener("click", () => {
        afficherReponse();
        onEcrit(true); // sert pour l'affichage du caractère d'attente
        reponseGPT = ""; 
        document.getElementById("info").innerHTML = "";
        chrome.runtime.sendMessage({
            Phase  : 3,
            Message : document.getElementById("prompt").value + " " + document.getElementById("selectionInput").value
        })
    });
    document.getElementById("fermer").addEventListener("click", () => {
        window.close();
    });
    document.getElementById("arreter").addEventListener("click", () => {
        console.log("on demande un arrêt");
        chrome.runtime.sendMessage({
            Phase  : -2,
            Message : "Arrêter"
        })
        console.log("Arrêt demandé");
    });
    document.getElementById("prompt").addEventListener("change", () => {
        // Définir la date d'expiration dans 1 an
        let dateExpiration = new Date();
        dateExpiration.setTime(dateExpiration.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = "prompt=" + encodeURIComponent(document.getElementById("prompt").value) + ";expires=" + dateExpiration.toUTCString();
    }); 
});




chrome.runtime.sendMessage({ //au chargement, on essaie de récupérer la sélection
		Phase : 1,
		Message : "getSelection"
})
var selection = "";
chrome.runtime.onMessage.addListener((request) => {
    //console.log (request.Message);
    switch (request.Phase) {
        case 2:
            selection = request.Message;
            document.getElementById("selectionInput").value = selection;
            console.log("Sélection :", selection);
            break;
        case 4: // on a reçu la réponse de chatgpt, on l'affiche
            let outputGPT = document.getElementById("outputGPT");
            if (!onAfficheReponse) { // se produit dans le cas où on reçoit une réponse de ChatGPT, alors qu'on n'a pas cliqué sur le bouton. cela se produit quand on a quitté la popup sans avoir attendu la fin du prompt : ici on récupère notre affichage
                afficherReponse();
                onAfficheReponse = true;
                onEcrit(true);
            }
            reponseGPT = request.Message;
            outputGPT.value = request.Message + waitChar;
            outputGPT.scrollTop = outputGPT.scrollHeight;
            break;
        case 5:
            onEcrit(false);
            if (!onAfficheReponse) afficherReponse();   // c'est le cas où on recevrait un message 5 alors qu'on n'est pas en train d'afficher la réponse. Ce cas correspond au msg 5 qui arriverait alors qu'on vient d'ouvrir la popup, sur une requête précédente
            document.getElementById("outputGPT").value = request.Message;
            document.getElementById("fermer").style="display:inline";
            //document.getElementById("info").innerHTML = "Réponse terminée !";
            break;
    }
});

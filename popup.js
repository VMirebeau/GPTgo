document.addEventListener("DOMContentLoaded", (event) => {
    var prompt = document.cookie.split(';')[0].split('=')[1];
   // console.log(prompt);
    document.getElementById("prompt").value = decodeURIComponent(prompt);

    document.getElementById("bouton").addEventListener("click", () => {
        //document.getElementById("titre").innerHTML = "Meuh";
        document.getElementById("requete").style.display = "none";
        document.getElementById("resultat").style.display = "inline";
        document.getElementById("info").innerHTML = "";
        chrome.runtime.sendMessage({
            Phase  : 3,
            Message : document.getElementById("prompt").value + " " + selection
        })
        
    });


    document.getElementById("prompt").addEventListener("change", () => {
        document.cookie = "prompt=" + encodeURIComponent(document.getElementById("prompt").value);
       // console.log (document.cookie);
    });
//    
});

chrome.runtime.sendMessage({ //au chargement, on essaie de récupérer la sélection
		Phase : 1,
		Message : "getSelection"
})
var selection = "";
// Listening for incoming Messages from the Background
chrome.runtime.onMessage.addListener((request) => {
    //console.log (request.Message);
    switch (request.Phase) {
        case 2:
            selection = request.Message;
            document.getElementById("selectionInput").value = selection;
            console.log("Sélection :", selection);

            break;
        case 4: // on a reçu la réponse de chatgpt
            //console.log ("Réponse de ChatGPT", request.Message);
            //console.log("phase 5 dans le popup");
            document.getElementById("outputGPT").value = request.Message;
            break;
        case 5:
            alert ("case 5 !");
            document.getElementById("outputGPT").value = request.Message;
            document.getElementById("info").innerHTML = "Réponse terminée !";
            break;
    }
});

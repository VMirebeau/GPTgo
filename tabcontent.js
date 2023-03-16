chrome.runtime.onMessage.addListener((request) => {
	if (request.Phase == 1) // l'onglet popup nous demande quelle est la sélection
	{
		chrome.runtime.sendMessage({ // on envoie un message au background.js avec la sélection
			Phase  : 2 ,
			Message : window.getSelection().toString()
		});
	}
	console.log("On nous a demandé la sélection :", window.getSelection().toString());
})



// On écoute les message des ContentScripts
chrome.runtime.onMessage.addListener(async request => {
	if(request.Phase){

		switch (request.Phase) {
			case 1: // on demande la sélection au tab actif
				var [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
				chrome.tabs.sendMessage(tab.id, request) // on transmet le "getSelection" à l'onglet actif
				break;
			//case 2: géré directement par le popup.htm
			case 3: // on envoie le prompt à chatGPT
				console.log("on veut envoyer le prompt :", request.Message);
				var [tab] = await chrome.tabs.query({url: "https://chat.openai.com/chat"}); // on cherche l'ID du tab où tourne ChatGPT
				chrome.tabs.sendMessage(tab.id , request);
				break;
			//case 4: géré directement par le popup.htm
			//	break;
		}


	}
})



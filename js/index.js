var firebaseConfig = {
    apiKey: "AIzaSyB2kTxjCv5qeItZPKkAV84nSI6CR_-9SXU",
    authDomain: "wherethespoons.firebaseapp.com",
    databaseURL: "https://wherethespoons.firebaseio.com",
    projectId: "wherethespoons",
    storageBucket: "",
    messagingSenderId: "47429380907",
    appId: "1:47429380907:web:7b5171603fa8880bcf336e"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function searchError(msg) {
	$("#error-msg").html(msg)
}

$(document).ready(() => {
	const db = firebase.firestore()

	$("#go-button").click((e) => {
		const sesh = $("#session-id-input").val()
		if (sesh.length == 0) {
			searchError("Please enter sesh ID");
			return;
		}

		db.collection("sessions").doc(sesh).get().then((session) => {
			const users = session.data();
			if (users == undefined) {
				searchError("Could not find sesh :(");
			} else {
				window.location.href = `/map.html?id=${sesh}`
			}
		}).catch(err => console.log(err));
	})
});
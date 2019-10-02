const API_KEY = "AIzaSyBs9sc8OdSepiJP01h7-pgtxO4dj4YbHto"
const SEARCH_TERM = "wetherspoons"
const SEARCH_FIELDS = "formatted_address,name"
const SEARCH_RADIUS = 2000

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

let map, seshID, seshDoc;

$(document).ready(() => {
	const idIndex = window.location.href.indexOf('?id=');
	// If sesh ID isn't provided in the URL then go back to homepage
	if (idIndex == -1) goHome();
	seshID = window.location.href.substring(idIndex + 4);

	// Load sesh users
	const db = firebase.firestore();
	seshDoc = db.collection("sessions").doc(seshID);
	seshDoc.onSnapshot((session) => {
		if (session.data() == undefined) {
			alert("sesh not found");
			goHome();
		}
		const users = session.data()['users'];
		updateMarkers(users);
	});

	const addUserButton = $('.add-user-btn')
	addUserButton.click((e) => {
		const name = $('#name-input').val();
		const address = $('#address-input').val();
		getCoords(address, name)
		$('.sesh-users-list').append(`<li>${name}, ${address}</li>`);
	})
});

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 51, lng: 0},
		zoom: 5
	});
}

function goHome() {
	window.location.href = '/index.html';
}

function addMarker(title, position) {
	return new google.maps.Marker({
		position,
		map,
		label: title[0].toUpperCase(),
		title
	});
}

function updateMarkers(users) {
	const markers = [];
	const bounds = new google.maps.LatLngBounds();
	const list = $('.sesh-users-list')
	list.html('')
	for (const user of users) {
		// Add name and address to list
		updateListElement(list, user);
		// Add marker to map
		const pos = new google.maps.LatLng(user.lat, user.lng)
		bounds.extend(pos)
		markers.push(addMarker(user.name, pos));
	}
	map.fitBounds(bounds);
	findPlace();
}

function updateListElement(list, user) {
	list.append(`<li>${user.name}, ${user.address}</li>`);
}

function findPlace() {

	var request = {
		query: 'Wetherspoons',
		fields: ['name', 'geometry'],
		locationBias: {lat: 37.402105, lng: -122.081974}
	};

	var service = new google.maps.places.PlacesService(map);

	service.findPlaceFromQuery(request, function(results, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			for (const r of results) {
			console.log(r)
			}
			map.setCenter(results[0].geometry.location);
		}
	});
}

function getCoords(addr, name) {
	$.ajax(`https://maps.googleapis.com/maps/api/geocode/json?address=${addr.replace(' ', '+')}&key=${API_KEY}`, {
		success: (data) => {
			uploadUser(name, data.results[0].formatted_address, data.results[0].geometry.location);
		}
	});
}

function uploadUser(name, address, loc) {
	seshDoc.update({
		"users": firebase.firestore.FieldValue.arrayUnion({
			name,
			address,
			"lat": loc.lat,
			"lng": loc.lng
		})
	});
	localStorage.setItem('sesh', `${seshID}`);
}
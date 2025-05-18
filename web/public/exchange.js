const STORAGE = "./dbs"
const GENERAL = STORAGE + "/general_data.json"
let users_online = []

function registerUser(){
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    const ciudad = document.getElementById("ciudad").value;
    let data = {
        "username": username,
        "password": password,
        "email": email,
        "ciudad": ciudad
    }
}

function loginUser(username) {}

function logoutUser(username) {}

function changeUserData(){}

function makeReview(username, city, category, review, points){}

function deleteReview(username, city, category){}

function updateReview(username, city, category, review, points){}

function updateGeneralData(){}

function loadGeneralData(){}
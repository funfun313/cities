const storage = firebase.app().storage();
const storageRef = storage.ref();

const dbRef = firebase.app().database();
const postsRef = dbRef.ref('posts');
const usersRef = dbRef.ref('users');

const f = document.getElementById("myFile");


const appAuth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const userDisplay = document.getElementById("currentuser");
const loginDisplay = document.getElementById("loginlink");
const logoutDisplay = document.getElementById("logoutlink");
const uploadDisplay = document.getElementById("openupload");


window.onload = function(){
    //see autnentication state
    appAuth.signOut().then(function(){
        userDisplay.innerHTML = "";
        loginDisplay.style.display = "block";
        logoutDisplay.style.display = "none";
        uploadDisplay.style.display = "none";
    })
    // start logged out

    postsRef.once("value").then(function(snapshot){
        //displayAllPhotos(snapshot);
    });
    
}

// this function listens for changes to the database
postsRef.on("value", function(snapshot){
    console.log(snapshot);
    displayAllPhotos(snapshot);
})

//this function listens to changes in authenication
appAuth.onAuthStateChanged(function(user){
    if(!appAuth.currentUser){
        console.log("not logged in");
        const photodiv = document.getElementById("photodisplay");
        photodiv.innerHTML = "";  
    }
    else{
        //check if allowed user
        usersRef.once("value").then(function(snapshot){
            //displayAllPhotos(snapshot);
            console.log(snapshot);

            snapshot.forEach(function(item){
                if( item.val() == user["email"]){
                    postsRef.once("value").then(function(snapshot){
                    //displayAllPhotos(snapshot);
                    displayAllPhotos(snapshot);
                    })
                }
            })
        })
    }
})

function displayAllPhotos(snapshot){
    if(!appAuth.currentUser){
        return;
    }

    // set up html to recieve image info
    const photodiv = document.getElementById("photodisplay");
    photodiv.innerHTML = "";
    
    snapshot.forEach(function(catSnapshot){
        catSnapshot.forEach(function(childSnapshot){
            console.log(childSnapshot.val());
            console.log(childSnapshot.val().img_pth);
            let img = storageRef.child(childSnapshot.val().img_pth);
            console.log("set img");
            img.getDownloadURL().then(function(url){
                    // write some html
                    console.log("right before the html");
                photodiv.innerHTML = photodiv.innerHTML + "<div><div class='photo'><div class= 'author'>"+ childSnapshot.val().author +  "</div><img src = '" + url + "' width = '200px'><div class='caption'>"+ childSnapshot.val().caption +"</div></div><div class = 'likes'><img src='img/heartunfilled.png' width = '25px' class = 'imgheart'> <span class = 'likecount'> 123 </span></div></div> ";
            })

                    
        })

    })

}
function upload(){
    console.log("starting to store file...");
    let imgname = f.files[0]["name"];

    storageRef.child(imgname).put(f.files[0]).then(function(snapshot){
        console.log(snapshot);
        console.log(imgname);
        savePicInfo(imgname);  

    }

    )
    closeupload();
}

function savePicInfo(img){
    // get the value from the radio buttons
    let radiobtn_list = document.getElementsByName("category");
    let category = "";
    for(let i = 0; i < radiobtn_list.length; i++){
        let radiobtn = radiobtn_list[i];
        if(radiobtn.checked){
            category = radiobtn.value;
        }
    }
    console.log(category);
    console.log(img);
    console.log(document.getElementById("captiontext").value);
    
    postsRef.child(category).push( {
            author: appAuth.currentUser.displayName,
            caption: document.getElementById("captiontext").value,
            img_pth: img,
            date_added: Date.now()
        }
    );    
}

function openupload(){
    const uploaddiv = document.getElementById("uploadarea");
    uploaddiv.style.display = "inline-block";
}

function closeupload(){
    const uploaddiv = document.getElementById("uploadarea");
    uploaddiv.style.display = "none";
}

function doselect(){
    document.getElementById("myFile").click();
}
function getUserValue(item){
    console.log(item.val());

}

function login(){
    appAuth.signInWithPopup(provider).then(function(result){
        //check if email is on allowed list in the database
        usersRef.once("value").then(function(snapshot){
            //displayAllPhotos(snapshot);
            console.log(snapshot);

            snapshot.forEach(function(item){
                console.log(result["user"]["email"])
                if( item.val() == result["user"]["email"]){
                    //console.log(result["user"]["displayName"]);
                    userDisplay.innerHTML = result["user"]["displayName"];
                    loginDisplay.style.display = "none";
                    logoutDisplay.style.display = "block"; 
                    uploadDisplay.style.display = "block";

             
                }
                
            });
        });
        
   
    });

}

function logout(){
    appAuth.signOut().then(function(){
        userDisplay.innerHTML = "";
        loginDisplay.style.display = "block";
        logoutDisplay.style.display = "none";

        uploadDisplay.style.display = "none";
    })
    
} 
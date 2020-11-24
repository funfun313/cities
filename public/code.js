const storage = firebase.app().storage();
const storageRef = storage.ref();

const dbRef = firebase.app().database();
const postsRef = dbRef.ref('posts');
const usersRef = dbRef.ref('users');
const likesRef = dbRef.ref('likes');

const f = document.getElementById("myFile");


const appAuth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const userDisplay = document.getElementById("currentuser");
const loginDisplay = document.getElementById("loginlink");
const logoutDisplay = document.getElementById("logoutlink");
const uploadDisplay = document.getElementById("openupload");

//let likesCount = 0;
//let imgHeart = 'img/heartunfilled.png';

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

// listens to changes in the likes
likesRef.on("value", function(snapshot){
    postsRef.once("value").then(function(photosnapshot){
        photosnapshot.forEach(function(categorysnapshot){
            categorysnapshot.forEach(function(myphoto){
                displayLikes(myphoto.key);
            })
        })

    })
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
           console.log(appAuth.currentUser);
            // look up if this user has liked this photo
            
            likesRef.once("value").then(function(likesSnapshot){
                let likesCount = 0;
                let imgHeart = 'img/heartunfilled.png';
                likesSnapshot.forEach(function(like){
                    if(like.val().photoID == childSnapshot.key){
                        likesCount += 1;
                        if(like.val().userEmail == appAuth.currentUser.email){
                            imgHeart = 'img/heartfilled.png';
                            console.log("like found");
                        }
                        
                    }
                })
                let img = storageRef.child(childSnapshot.val().img_pth);
                console.log("set img");
                img.getDownloadURL().then(function(url){
                        // write some html
                        console.log(imgHeart);
                    photodiv.innerHTML = photodiv.innerHTML + "<div><div class='photo'><div class= 'author'>"+ childSnapshot.val().author +  "</div><img src = '" + url + "' width = '200px'><div class='caption'>"+ childSnapshot.val().caption +"</div></div><div class = 'likes'><button onclick='addLike(\""+ childSnapshot.key +"\")'><img src='"+ imgHeart +"' width = '25px' class = 'imgheart'></button><span class = 'likecount'>"+likesCount+"</span></div></div> ";
                })
            })       
        })
    })
}

function displayLikes(currentPhotoID){
    // look up if this user has liked this photo
    let likesCount = 0;
    let imgHeart = 'img/heartunfilled.png';
    likesRef.once("value").then(function(likesSnapshot){
        likesSnapshot.forEach(function(like){
            if(like.val().photoID == currentPhotoID){
                likesCount += 1;
                if(like.val().userEmail == appAuth.currentUser.email){
                    imgHeart = 'img/heartfilled.png';
                    console.log("like found");
                }
                
            }
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

function addLike(currentPhoto){
    var addNewLike = true;
    likesRef.once("value").then(function(snapshot){
        snapshot.forEach(function(currentLike){
            console.log(currentLike.val()); 
            if(currentLike.val()["userEmail"] == appAuth.currentUser.email && currentPhoto == currentLike.val()["photoID"]){
                // matched like to email and photo
                 console.log(currentLike.key);
                 currentLikeRef = likesRef.child(currentLike.key);
                // delete like from the database
                currentLikeRef.remove().then(function(){
                    return;
                });
                //exit the function 

            }
            else{
                addNewLike = false;
            } 
        }) //got out of the loop for checking for likes 
        if (addNewLike){
            likesRef.push( {
                userEmail : appAuth.currentUser.email,
                photoID : currentPhoto,
            })
            
        }
    })
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
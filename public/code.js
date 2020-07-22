const storage = firebase.app().storage();
const storageRef = storage.ref();


function upload(){
    console.log("starting to store file...");
    const f = document.getElementById("myFile");
    let imgname = f.files[0]["name"];

    storageRef.child(imgname).put(f.files[0]).then(function(snapshot){
        console.log(snapshot);
        
    }

    )
}

function openupload(){
    const uploaddiv = document.getElementById("uploadarea");
    uploaddiv.style.display = "block";
}

function closeupload(){
    const uploaddiv = document.getElementById("uploadarea");
    uploaddiv.style.display = "none";
}
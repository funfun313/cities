const storage = firebase.app().storage();
const storageRef = storage.ref();

const f = document.getElementById("myFile");

window.onload = function(){
    storageRef.listAll().then(function(result){
        console.log(result.items);
        // set up html to recieve image info
        const photodiv = document.getElementById("photodisplay");
        photodiv.innerHTML = "";
        // loop through the images
        result.items.forEach(function(img){
            img.getDownloadURL().then(function(url){
                // write some html
                photodiv.innerHTML = photodiv.innerHTML + "<div class='photo'><span class= 'author'>Wonder Woman</span><img src = '" + url + "' width = '200px'><span class-'caption'>what an amazing photo :)</span></div>";
            })
        })
    })
}

function upload(){
    console.log("starting to store file...");
    let imgname = f.files[0]["name"];

    storageRef.child(imgname).put(f.files[0]).then(function(snapshot){
        console.log(snapshot);
        
    }

    )
    closeupload();
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
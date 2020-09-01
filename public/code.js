const storage = firebase.app().storage();
const storageRef = storage.ref();

const dbRef = firebase.app().database();
const postsRef = dbRef.ref('posts');

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
                photodiv.innerHTML = photodiv.innerHTML + "<div class='photo'><div class= 'author'>Wonder Woman</div><img src = '" + url + "' width = '200px'><div class='caption'>what an amazing photo :)</div></div>";
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
        if(radiobtn.selected){
            category = radiobtn.value;
        }
    }

    postsRef.child(category).push( {
            author: 'AUTHOR',
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
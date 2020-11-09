
let star1 = document.getElementById("star1")
let star2 = document.getElementById("star2")
let star3 = document.getElementById("star3")
let star4 = document.getElementById("star4")
let star5 = document.getElementById("star5")
let rating = 0;

star1.addEventListener("click", (e)=>{
  rating = 1;
  if(star1.className === "fa fa-star checked"){
    star2.className="fa fa-star";
    star3.className="fa fa-star";
    star4.className="fa fa-star";
    star5.className="fa fa-star";
  }
  else{
    star1.className="fa fa-star checked";
  }
});
star2.addEventListener("click", (e)=>{
  rating = 2;
  if(star2.className === "fa fa-star checked"){
    star3.className="fa fa-star";
    star4.className="fa fa-star";
    star5.className="fa fa-star";
  }
  else{
    star1.className="fa fa-star checked";
    star2.className="fa fa-star checked";
  }
});
star3.addEventListener("click", (e)=>{
  rating = 3;
  if(star3.className === "fa fa-star checked"){
    star4.className="fa fa-star";
    star5.className="fa fa-star";
  }
  else{
    star1.className="fa fa-star checked";
    star2.className="fa fa-star checked";
    star3.className="fa fa-star checked";
  }
});
star4.addEventListener("click", (e)=>{
  rating = 4;
  if(star4.className === "fa fa-star checked"){
    star5.className="fa fa-star";
  }
  else{
    star1.className="fa fa-star checked";
    star2.className="fa fa-star checked";
    star3.className="fa fa-star checked";
    star4.className="fa fa-star checked";
  }
});
star5.addEventListener("click", (e)=>{
  rating = 5;
  star1.className="fa fa-star checked";
  star2.className="fa fa-star checked";
  star3.className="fa fa-star checked";
  star4.className="fa fa-star checked";
  star5.className="fa fa-star checked";
});

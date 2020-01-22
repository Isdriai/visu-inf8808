(function () {
  "use strict";

  // Sélection de l'élément SVG
  var svg = d3.select("svg");

  /* TODO : trouver la fonction dans D3 permettant de trouver tous les cercles se trouvant dans l'élément
            SVG puis stocker le résultat dans la variable "circles".

            / find the function in D3 allowing you to get all the circles in the SVG element and store
            the result in the variable "circles"
  */

  d3.select("#create-circles-button")
    .on("click", createCircles);

  d3.select("#delete-circles-button")
    .on("click", deleteCircles);

  /**
   * Mise à jour de la variable contenant les cercles ainsi que de l'affichage du nombre de cercles se trouvant
   * dans l'élément SVG.
   * 
   * / Update the variable containing the circles as well as the display of the number of circles in the SVG element
   */
  function update() {
    /* TODO
       1) Mettre à jour la variable circles
       2) Mettre à jour le texte indiquant le nombre de cercles présents dans l'élément SVG

       / 

       1) Update the circles variable
       2) Update the text indicating the number of circles in the SVG element
     */

    var circles_counts = document.getElementById("circles-count")
    circles_counts.innerHTML = document.getElementsByTagName("circle").length
  }

  /**
   * Création de nouveaux cercles.
   * 
   * / 
   * 
   * Creation of new circles
   */
  function createCircles() {
    /* TODO :
       1) Trouver comment accéder à la valeur du champ spécifiant la quantité de cercles à créer.
       2) Vérifier que cette valeur est correcte.
       3) Si cette valeur est correcte, créer le nombre de cercles demandé avec une boucle for
          (utiliser la fonction generateRandomCircle()).
       4) Si cette valeur n'est pas correcte, créer une alerte informant l'utilisateur.

       /

       1) Find how to access the value of the field indicating how many circles to create

       2) Check the value is correct
       3) If this value is correct, create the indicated number of circles with a for-loop 
          (use function generateRandomCircle())
       4) If this value is not corect, create an alert informing the user. 
    */

   var nbr_circles = parseInt(document.getElementById("quantity").value, 10)
   for(var i = 0; i<nbr_circles;i++){
    generateRandomCircle()
   }
  }

  /**
   * Suppression de tous les cercles présents dans l'élément SVG.
   * 
   * / 
   * 
   * Deletion of all the circles in the SVG element
   */
  function deleteCircles() {
  /* TODO :
     1) Afficher une boîte de confirmation afin de confirmer si l'utilisateur souhaite supprimer tous les cercles.
     2) Supprimer tous les cercles si l'utilisateur souhaite les supprimer, sinon ne rien faire.
     
     / 

     1) Show a confirmation box to confirm if the user wants to delete all the circles
     2) Delete all the circles if the users wants, if not do nothing. 
    */

   var conf = confirm("Veuillez confirmer la suppression de tous les cercles !")

   if (conf == true) {
    d3.selectAll("circle").remove()
    update()
   }
  }

  /**
   * Génération d'un cercle dans l'élément SVG avec une position et une taille aléatoire.
   * 
   * /
   * 
   * Generating a circle in the SVG element with random position and size.
   */
  function generateRandomCircle() {
    var BORDER = 10;
    var DIMENSION = 500;
    var cx = Math.random() * DIMENSION;
    var cy = Math.random() * DIMENSION;

    svg.append("circle")
      .attr("cx", function () {
        return cx;
      })
      .attr("cy", function () {
        return cy;
      })
      .attr("r", function () {
        return Math.random() * 10 + 10;
      })
      .attr("fill", function () {
        if ((cx > cy + BORDER) && (cx + cy < DIMENSION - BORDER)) return "orange";
        else if ((cx > cy + BORDER) && (cx + cy > DIMENSION + BORDER)) return "blue";
        else if ((cx < cy - BORDER) && (cx + cy < DIMENSION - BORDER)) return "purple";
        else if ((cx < cy - BORDER) && (cx + cy > DIMENSION + BORDER)) return "green";
        else return "black";
      })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
    update();
  }

  /**
   * Obtient le texte à afficher dans l'infobulle.
   * 
   * /
   * 
   * Gets the text to show in the tooltip
   *
   * @param radius      Le rayon du cercle. / Radius of the circle.
   * @param position    La position du cercle. / Position of the circle.
   * @param color       La couleur du cercle. / Colo of the circle.
   * @return {string}   Le texte à afficher dans l'infobulle. / Text to show in the tooltip. 
   */

  function htmlRad(radius) {
    return "<font color=\"red\">Rayon</font> du cercle : <font color=\"red\">" + radius + "</font>"
  }

  function htmlCenter(position) {
    return "<font color=\"cyan\">Centre</font> du cercle : (<font color=\"cyan\">" 
          + position[0] + "</font>,<font color=\"cyan\">" + position[1] + "</font>)"
  }

  function htmlColor(color) {
    return "<font color=\"yellow\">Couleur</font> du cercle : <font color=\"yellow\">" 
          + color + "</font>"
  }

  function textTip(radius, position, color) {
    /* TODO : mettre en forme les informations pertinentes du cercle pointé
       Vous pouvez utiliser la balise <br> pour faire revenir le texte à la ligne

       / 

       format the important information of the pointed circle
       You can use <br> to skip lines

     */
    var skip = "<br>"
    var ret = htmlRad(radius) + skip + htmlCenter(position) + skip + htmlColor(color)
    return ret

    
  }

  function round(float) {
    return Math.round( float * 10 ) / 10
  }

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function () {

      /* TODO : Récupérer les informations pertinentes du cercle pointé. Ces éléments sont :
         1) Le rayon du cercle
         2) La position du cercle
         3) La couleur du cercle

         / 

         Get the important information of the pointed circle. These are : 
         1) The radius
         2) The position
         3) The color
       */
      
      
      var x = event.clientX, y = event.clientY,
    elementMouseIsOver = document.elementFromPoint(x, y);

    if(elementMouseIsOver.localName === "circle") {
      var radius = round(elementMouseIsOver.getAttribute("r"));
      var position = [round(elementMouseIsOver.getAttribute("cx")), 
                    round(elementMouseIsOver.getAttribute("cy"))];
      var color = elementMouseIsOver.getAttribute("fill");
      
      return textTip(radius, position, color);  
    }
    });

  svg.call(tip);
})();


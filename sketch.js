// Handpose: Drawing with Fingertips
// Matthew Bodenstein (217996505)
// 11/09/2023

// Reference
// https://learn.ml5js.org/#/reference/handpose

let handpose;
let video;
let predictions = [];

function setup() {
  createCanvas(640, 480, WEBGL);

  video = createCapture(VIDEO);
  video.size(width, height);

  handpose = ml5.handpose(video, modelReady);
  
  handpose.on("predict", (results) => {
    predictions = results;
  });
  
  video.hide();
}

function modelReady() {
  console.log("Model ready!");
}

function draw() {
  background(0);
  
  // In WebGL mode, the origin of the coordinate is at the center of the canvas.
  // So translate the origin to the top-left because landmarks are based on the image coordinate where its origin is at the top-left corner.
  translate(-width / 2, -height / 2);
  
  image(video, 0, 0, width, height);

  drawLineswithFingerTips();
}

// Store fingertip points for each finger
let fingertipPoints = {
  thumb: [],
  indexFinger: [],
  middleFinger: [],
  ringFinger: [],
  pinky: []
};

let maxPoints = 20;

// A function to draw ellipses over the detected keypoints
function drawLineswithFingerTips() {
  if(predictions.length > 0) {
    const prediction = predictions[0];
    
    // Iterate over each finger and draw the fingertip
    for (let finger in fingertipPoints) {
      let fingerLandmarks = prediction.annotations[finger];
      let x = fingerLandmarks[3][0];
      let y = fingerLandmarks[3][1];
      ellipse(x, y, 10, 10);
      
      // Store fingertip points for each finger
      fingertipPoints[finger].push([x, y]);
      
      // Remove the first point if the number of points stored exceeds the maximum
      if (fingertipPoints[finger].length > maxPoints) {
        // shift() removes the first element from an array
        fingertipPoints[finger].shift();
      }
      
      // Apply moving average filter
      let [avgX, avgY] = smoothPoints(fingertipPoints[finger]);  
      fill(0, 255, 255);
      ellipse(avgX, avgY, 10, 10);
    }
    
    // Draw lines based on stored points for each finger
    for (let finger in fingertipPoints) {
      stroke(255, 0, 255);
      drawLines(fingertipPoints[finger]);
    }
  }
}

// A moving average filter function to smooth points
function smoothPoints(points) {
  let sumX = 0;
  let sumY = 0;
  for (let p of points) {
    sumX += p[0];
    sumY += p[1];
  }

  let avgX = sumX / points.length;
  let avgY = sumY / points.length;
  
  // Return the results as an array
  return [avgX, avgY];
}

// A function to draw lines based on a given array of points
function drawLines(points) {
  for (let i = 1; i < points.length; i++) {
    let start = points[i - 1]; 
    let end = points[i];
    line(start[0], start[1], end[0], end[1]);
  } 
}

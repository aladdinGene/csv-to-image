const fs = require('fs')
var args = process.argv.slice(2);
const calculateData = (inputVal, outputDir) => {
	const fs = require('fs')
	const { createCanvas, loadImage } = require('canvas')

	const width = 640
	const height = 640

	const canvas = createCanvas(width, height)
	const ctx = canvas.getContext('2d')
	var tempInput = inputVal.slice();
	for(var i=1;i<(tempInput.length - 1);i++){
	    if(tempInput[i]==0 && tempInput[i-1]>0 && tempInput[i+1]>0){
	        tempInput[i] = (tempInput[i+1] + tempInput[i-1]) / 2
	    }
	}
	var bbb = [], ccc = [], matrix = [];
	for(var i=0;i<tempInput.length;i++){
	    var y = Math.floor(i/64) * 10
	    var x = (i%64) * 10
	    var value = tempInput[i]
	    bbb.push({x, y, value})
	    for(var j=0;j<10;j++)
	        ccc.push(tempInput[i])
	    if(i % 64 === 63){
	        for(var j=0;j<10;j++)
	            matrix.push(ccc)
	        ccc = []
	    }
	}

	function getModifiedVal(x, y) {
	    var step = 3
	    var xStart = (x - step) >= 0 ? x - step : 0
	    var xEnd = (x + step) < 640 ? x + step : 639
	    var yStart = (y - step) >= 0 ? y - step : 0
	    var yEnd = (y + step) < 640 ? y + step : 639
	    var valueSum = 0, distSum = 0;
	    var whitePoint = 0
	    for(var xCounter = xStart ;xCounter <= xEnd;xCounter++){
	        for(var yCounter = yStart;yCounter <= yEnd;yCounter++){
	            if(matrix[xCounter][yCounter] == 0) whitePoint++
	            if(whitePoint > (step**2*4)/1.2) return matrix[x][y];
	            var dist = Math.sqrt((xCounter - x) ** 2 + (yCounter - y) ** 2);
	            if(dist < step) {
	                if(dist == 0){
	                    distSum += 1;
	                    valueSum += matrix[x][y]
	                } else {
	                    distSum += 1 / (dist );
	                    valueSum += matrix[xCounter][yCounter] / (dist)
	                }
	            }
	            
	            
	        }
	    }
	    if(distSum == 0) return 0;
	    var res = valueSum / distSum
	    return res;
	}

	const getColor = function (levels, value) {

	    var val = value,
	        tmp = 0,
	        lim = 0.55,
	        min = 0,
	        max = 30,
	        dif = max - min,
	        lvs = 25;
	    var colorSamples = [[255,255,255], [255,255,0], [0, 255, 0], [255, 128, 0], [255, 0, 0]];

	    if (val <= min) {
	        val = min;
	        return colorSamples[0]
	    } else if (val >= max) {
	        val = max;
	        return colorSamples[4]
	    } else {
	        var floor = 0
	        var ceil = 1
	        var step = 5
	        var floorVal = 0
	        var ceilVal = 5
	        if(val < 5){
	            floor = 0
	            ceil = 1
	            step = 5
	        } else if(val < 15){
	            floor = 1
	            floorVal = 5
	            ceil = 2
	            ceilVal = 15
	            step = 10
	        } else if(val < 25){
	            floor = 2
	            floorVal = 15
	            ceil = 3
	            ceilVal = 25
	            step = 10
	        } else if(val < 30){
	            floor = 3
	            floorVal = 25
	            ceil = 4
	            ceilVal = 30
	            step = 5
	        }
	        var r = Math.floor((colorSamples[floor][0] * (val - floorVal) + colorSamples[ceil][0] * (ceilVal - val)) / step)
	        var g = Math.floor((colorSamples[floor][1] * (val - floorVal) + colorSamples[ceil][1] * (ceilVal - val)) / step)
	        var b = Math.floor((colorSamples[floor][2] * (val - floorVal) + colorSamples[ceil][2] * (ceilVal - val)) / step)
	        return [r, g, b]
	    }
	};
	async function modifyMatrix(count){
	    for(var k=0;k<count;k++){
	        var tempMatrix = []
	        for(var i=0;i<640;i++){
	            tempMatrix[i] = []
	            for(var j=0;j<640;j++){
	                tempMatrix[i][j] = getModifiedVal(i, j)
	            }
	        }
	        matrix = tempMatrix.slice()
	    }
	}
	async function drawCanvas(){
	    var img = ctx.getImageData(0, 0, 640, 640);
	    var imgData = img.data
	    await modifyMatrix(12)
	    for(var i=0;i<640;i++){
	        for(var j=0;j<640;j++){
	            var colors = getColor(false, matrix[i][j])
	            var idx = (i * 640 + j) * 4;
	            imgData[idx] = colors[0];
	            imgData[idx + 1] = colors[1];
	            imgData[idx + 2] = colors[2];
	            imgData[idx + 3] = 255;
	        }
	    }
	    ctx.putImageData(img, 0, 0);
	    const buffer = canvas.toBuffer('image/png')
	  	fs.writeFileSync(outputDir, buffer)
	}
	drawCanvas()
}


try {
  const data = (fs.readFileSync(args[0], 'utf8')).split(',').slice(0,4096)
  var tempInput = data.map(a => Number(a))
  calculateData(tempInput, args[1])
} catch (err) {
  console.error(err)
}
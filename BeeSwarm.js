define(['jquery', 'qlik', 'text!./BeeSwarm.css', './d3.v4.0.0-alpha.35.min','./d3.min'], function($, qlik, cssContent, d3, d3v3) {
	$("<style>").html(cssContent).appendTo("head");
	return {
    initialProperties: {
        version: 1.0,
        qHyperCubeDef: {
            qDimensions: [],
            qMeasures: [],
                qInitialDataFetch: [{
                    qWidth: 3,
                    qHeight: 3333
                }]
            }
        },
        definition: {
            type: "items",
            component: "accordion",
            items: {
                dimensions: {
                    uses: "dimensions",
                    min: 2,
                    max: 2
                },
                measures: {
                  uses: "measures",
                  min: 1,
                  max: 1
              },
              sorting: {
                  uses: "sorting"
              },

			  	settings : {
					uses : "settings",
					items : {												 
						colors: {
							ref: "ColorSchema",
							type: "string",
							component: "dropdown",
							label: "Color",
							show: true,
							options: 
							[ {
										value: "#fee391, #fec44f, #fe9929, #ec7014, #cc4c02, #993404, #662506",
										label: "Sequential"
									}, {
										value: "#662506, #993404, #cc4c02, #ec7014, #fe9929, #fec44f, #fee391",
										label: "Sequential (Reverse)"
									}, {
										value: "#d73027, #f46d43, #fee090, #abd9e9, #74add1, #4575b4",
										label: "Diverging RdYlBu"
									}, {
										value: "#4575b4, #74add1, #abd9e9, #fee090, #f46d43, #d73027",
										label: "Diverging BuYlRd (Reverse)"
									}, {
										value: "#deebf7, #c6dbef, #9ecae1, #6baed6, #4292c6, #2171b5, #08519c, #08306b",
										label: "Blues"
									}, {
										value: "#fee0d2, #fcbba1, #fc9272, #fb6a4a, #ef3b2c, #cb181d, #a50f15, #67000d",
										label: "Reds"
									}, {
										value: "#edf8b1, #c7e9b4, #7fcdbb, #41b6c4, #1d91c0, #225ea8, #253494, #081d58",
										label: "YlGnBu"
									}
								],
									defaultValue: "#4575b4, #74add1, #abd9e9, #fee090, #f46d43, #d73027"
								},
								
						speed:{
							ref: "speed",
							type: "integer",
							component: "dropdown",
							label: "Bubble Size",
							defaultValue: 5,
							expression: "optional",
							options: 
							[ {
										value: 1,
										label: "1"
									}, {
										value: 2,
										label: "2"
									}, {
										value: 3,
										label: "3"
									}, {
										value: 4,
										label: "4"
									}, {
										value: 5,
										label: "5"
									}, {
										value: 6,
										label: "6"
									}, {
										value: 7,
										label: "7"
									}, {
										value: 8,
										label: "8"
									}, {
										value: 9,
										label: "9"
									}, {
										value: 10,
										label: "10"
									}
										
								]
							
						},
						scaleType:{
							ref: "scaleType",
							type: "string",
							component: "dropdown",
							label: "Scale Type",
							options: 
								[ {
									value: "scaleLog",
									label: "Log Scale"
								}, {
									value: "scaleLinear",
									label: "Linear Scale"
								}
								],
							defaultValue: "scaleLog"
						}	
					}
				}
          }
      },
      snapshot: {
			canTakeSnapshot: true
		},
	
	
		paint: function ($element, layout) {
		
		//console.log(this);
			var measureMin1 = 0, measureMax1 = 0;
			measureMin1 = layout.qHyperCube.qMeasureInfo[0].qMin;
			measureMax1 = layout.qHyperCube.qMeasureInfo[0].qMax;
			
			var chartState = {};

			chartState.scale = layout.scaleType;
			
			var formatNumber = d3.format(",");
			
			/* // Create buttons to set Log and Linear scales via D3
			var html='<div width="10" position="relative" z-index="-10">';
			var i = 0;
			var idbutnom='Log Scale',
			idbutnom2='Linear Scale';		
			html=html+"<button class='button1' width='auto' id='button1'>" + idbutnom + "</button>"    
			html=html+"<button class='button2' width='auto' id='button2'>" + idbutnom2 + "</button>"    
			html=html+"</div>"
			;
			$element.html(html); */
	   
			// Set up the button click event
			$element.find("#button1").on("qv-activate", function() {
						
				var app = qlik.currApp();
				chartState.scale = "scaleLog";
				redraw(chartState, app.this);
					 
				});
					
			// Set up the button click event
			$element.find("#button2").on("qv-activate", function() {
					
				var app = qlik.currApp();
				chartState.scale = "scaleLinear";
				redraw(chartState, app.this);
				 
			});
			
			// Set margins
			var margin = {top: 30, right: 100, bottom: 60, left: 20};
	
			// Chart object width
			var width = $element.width()- margin.right - margin.left;
			// Chart object height
			var height = $element.height() - margin.bottom - margin.top;
			// Chart object id
			var id = "container_" + layout.qInfo.qId;
		    		 
			// Check to see if the chart element has already been created
			if (document.getElementById(id)) {
				// if it has been created, empty it's contents so we can redraw it
				$("#" + id).empty();
			}
			else {
				// if it hasn't been created, create it with the appropriate id and size
				$element.append($('<div />').attr({ "id": id, "class": "qv-object-BeeSwarm" }).css({ height: height, width: width }))
			}
			
			// Create the tooltip
			var tt = d3.select("#"+id)
					.append("div")	
					.attr("class", "tooltip")				
					.style("opacity", 0);
			
			// Create the svg element			   
           var svg = d3.select("#" + id).append("svg")  
                .attr("width", width + margin.right + margin.left)
				.attr("height", height + margin.bottom + margin.top)
			.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")				;				

			// Set up the xAxis
			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + (height - 35) + ")");
			
			//create matrix variable
			var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
		
			// create a new array that contains the measure labels
			var dimLabels = layout.qHyperCube.qDimensionInfo.map(function(d) {
				return d.qFallbackTitle;
			});
			
			// create a new array that contains the dim labels
			var measureLabels = layout.qHyperCube.qMeasureInfo.map(function(d) {
				return d.qFallbackTitle;
			});
			
			// Create a new array for our extension with a row for each row in the qMatrix
			var data = qMatrix;
			
			// Create a new array for our extension with a row for each row in the qMatrix
			// Filter dimesnion Null value 
			var nestedData = qMatrix.filter(function(d) { return d[0].qElemNumber >= 0; } ).map(function(d) {
				// for each element in the matrix, create a new object that has a property
				// for the grouping dimension, the first metric, and the second metric
				return {
					"Dim1":d[0].qText,
					"Dim1_key":d[0].qElemNumber,
					"Dim2":d[1].qText,
					"Dim2_key":d[1].qElemNumber,
					"Measure1":d[2].qNum
				}
			});
			
			// Create variables
			var index, xScale, xAxis, colors, legend, brush;
			
			// Grab the layout variables
			var speed = layout.speed,
				colorpalette = layout.ColorSchema.split(", "),
				domainLength = d3.max(nestedData, function (d) { return d.length; });
			;
	
			// Get the selected counts for the 2 dimensions, which will be used later for custom selection logic
			var selections = {
				dim1_count: layout.qHyperCube.qDimensionInfo[0].qStateCounts.qSelected,
				dim2_count: layout.qHyperCube.qDimensionInfo[1].qStateCounts.qSelected
			};
	
	
			// Set up the legend label
			legend = svg.append("text")
				.attr("text-anchor", "middle")
				.attr("x", width / 2)
				.attr("y", height)
				.attr("font-family", "PT Sans")
				.attr("font-size", 12)
				.attr("fill", "darkslategray")
				.attr("fill-opacity", 1);
	
	
			// Add the legend text
			legend.text(measureLabels);
			
			// Redraw the chart in D3
			redraw(chartState, this);
			
			function redraw(chartState, self){

			
					// Set the chart scale
					(
					chartState.scale == "scaleLinear" ? 
						xScale = d3.scaleLinear().range([ 10, width - 10 ]) : 
						xScale = d3.scaleLog().range([ 10, width - 10 ])
					)
					
					// Set the domain correctly
					xScale.domain(d3.extent(nestedData, function(d) { return +d.Measure1; }));
					
					// Set the xAxis
					xAxis = d3.axisBottom(xScale)
						.ticks(10, ".0s")
						.tickSizeOuter(0);

					// Set the colour properties
					colors = d3.scaleOrdinal()
									.domain([0, domainLength])
									.range(colorpalette);
					
					// Set transition for ticks in xAxis
					d3.transition(svg).select(".x.axis").transition().duration(500)
      					.call(xAxis);

					// Run forceSimulation
					var simulation = d3.forceSimulation(nestedData)
						.force("x", d3.forceX(function(d) { return xScale(d.Measure1); }).strength(1))
				    	.force("y", d3.forceY(height/3))
				    	.force("collide", d3.forceCollide(speed + 1))
				    	.stop();

					// Calculate the number of forceSimulations to run.
					// Note that performance degrades significantly as the volume of bubblesEnter and / or 
					// number of simulations increases, so try to find a balance between performance and adequate
					// force collision rendering
					var nestedLength = (Math.sqrt(nestedData.length)*4 > 100 ? 130 : Math.round(Math.sqrt(nestedData.length))*4) ;
					
					// Tick the simulation
					for (var i = 0; i < (nestedLength); ++i) simulation.tick();
					
					// Set up the svg brush
					brush = d3v3.svg.brush()
						.x(xScale)
						.on("brush", brushmove)
						.on("brushend", brushend) 
						;
					
					// Create the brush layer underneath the points
					svg.append("g")
						.attr("class", "brush")
						.call(brush)
					  .selectAll('rect')
						.attr('height', height - 35);
					
					// Create and colour the bubbles based on Dim1 and Dim2
					var bubblesEnter = svg.selectAll(".bubbles")
						.data(nestedData, function(d) { return d.Dim1})
						.enter()
						.append("circle")
						.attr("class", "bubbles")
						.attr("clip-path", "url(#clip)")
						.attr("cx", 0)
						.attr("cy", (height))
						.attr("r", speed)
						.attr("fill", function(d){ return colors(d.Dim2) })
						;

					// Set up despatchers for when starting the brush on a circle
					if(!navigator.msPointerEnabled ) {
					bubblesEnter.on('mousedown', function(){
						  brush_elm = svg.select(".brush").node();
						  new_click_event = new Event('mousedown');
						  new_click_event.pageX = d3.event.pageX;
						  new_click_event.clientX = d3.event.clientX;
						  new_click_event.pageY = d3.event.pageY;
						  new_click_event.clientY = d3.event.clientY;
						  brush_elm.dispatchEvent(new_click_event);
						});
					}

						
					// Create the D3 bubbles transition when switching Scale modes
					// using D3 buttons
					var bubblesUpdate = svg.selectAll(".bubbles")
						.data(nestedData, function(d) {return d.Dim1})
						.transition()
				    	.duration(500)
				    	.attr("cx", function(d) { return d.x; })
				    	.attr("cy", function(d) { return d.y; });

					
					// Create the tooltips using the position of the element being hovered on
				     d3.selectAll(".bubbles").on("mousemove", function(d) {
						tt.html(dimLabels[0] + ": <strong>" + d.Dim1 + "</strong><br>" +
						dimLabels[1] + ": <strong>" + d.Dim2 + "</strong><br>" 
						+ measureLabels[0] + ": <strong>" + formatNumber(d.Measure1) + "</strong>")
							.style('top', d3.select(this).attr("cy") - 40 + "px")
							.style('left', d3.select(this).attr("cx") + 100 + "px")
							.style("opacity", 0.9);
					}).on("mouseout", function(d) {
						tt.style("opacity", 0);
					}); 


				// When the brush is being painted
				function brushmove() {
					
				  var extent = brush.extent();
				  
				  // Mark the non-selected elements
				  bubblesEnter.classed("notSelected", function(d) {
					not_brushed = d.Measure1 < extent[0] || d.Measure1 > extent[1];
					return not_brushed;
				  });
				  
				  // Mark the selected elements
				  bubblesEnter.classed("selected", function(d) {
					is_brushed = extent[0] <= d.Measure1 && d.Measure1 <= extent[1];
					return is_brushed;
				  });
				}

				
				// When brushing is complete
				function brushend() {

				  transition_data();
				  reset_axis();
				  
				  d3.select(".brush").call(brush.clear());

				}

				function transition_data() {

					// Set up an array to store the data points selected by the brush
					var selectarray = [];
					var bubblesLength = bubblesEnter._groups[0].length;
					
					// Check the array of items
					for (index = 0; index < bubblesLength; index++) {
						// Check that the element is valid
						if(bubblesEnter._groups[0][index] != undefined) 
						{
							// Look for the selected elements
							if(bubblesEnter._groups[0][index].classList[1] == "selected") 
							{
								//Push the Dim1_key from the data array to get the unique selected values
								selectarray.push(bubblesEnter._groups[0][index].__data__.Dim1_key);	
							}
						}
					}
					
					//Make the selections
					self.backendApi.selectValues(0,selectarray,false);
			
				}

				function reset_axis() {
				  svg.transition().duration(500)
				   .select(".x.axis")
				   .call(xAxis);
				}

				//end of redraw*/
			}
		}
	};
});









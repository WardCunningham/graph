let drawing = false
let panSVG = null
const panZoom = {}

import {composite} from './composite.js'
import {dotify} from './dotify.js'
import {hoverbold} from './hoverbold.js'


export async function display(chosen,target) {
  let targetsvg = null

  if(!drawing){
    drawing = true
    const complex = composite(chosen)
    try {
      if (targetsvg) {
        panZoom.pan = panSVG.getPan()
        panZoom.zoom = panSVG.getZoom()
        panZoom.size = { 
            width: targetsvg.width.baseVal.valueInSpecifiedUnits, 
            height: targetsvg.height.baseVal.valueInSpecifiedUnits
          }
      }
      const dot = dotify(complex)
      window.dot = dot
      hpccWasm.graphviz.layout(window.dot, "svg", "dot").then(svg => {
        target.innerHTML = svg;
        targetsvg = target.querySelector('svg')

        drawing = false
        hoverbold(target)
        const targetBounds = { width: target.clientWidth, height: target.clientHeight } 
        const svgBounds = { width: targetsvg.clientWidth, height: targetsvg.clientHeight }
        let svgElement = targetsvg
        panSVG = svgPanZoom(svgElement)
        targetsvg.style.height = "100%"
        targetsvg.style.width = "100%"
        if (targetBounds.width < svgBounds.width || targetBounds.height < svgBounds.height) {
          panSVG.resize()
        }
        panSVG.fit()
        panSVG.center()
        if (panZoom.size && 
            panZoom.size.width == targetsvg.width.baseVal.valueInSpecifiedUnits &&
            panZoom.size.height == targetsvg.height.baseVal.valueInSpecifiedUnits) {
          panSVG.zoom(panZoom.zoom)
          panSVG.pan(panZoom.pan)
        }
      })
    } catch (err) {
      console.log('display error', err)
      drawing = false
    }
  } else {
    console.log('display: skipping', chosen)
  }
}

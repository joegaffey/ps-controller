
import { DualShock4 } from './webhid-ds4.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
  * { font-family: Arial, Helvetica, sans-serif; }
  .hidden { visibility: hidden; }
</style>
<object onload="ds4svg = this;" id="ds4svg" type="image/svg+xml" data="ds4.svg"></object>
<div class="hidden">
  <object onload="gyroSvg = this;" id="gyro_svg" type="image/svg+xml" data="vectors.svg"></object>
  <object onload="accelSvg = this;" id="accel_svg" type="image/svg+xml" data="vectors.svg"></object>
</div>   
`;

class PSController extends HTMLElement {
  
  constructor() {
    super();
    let shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(template.content.cloneNode(true));
  }
  
  async init () {
    this.ds4svg = this.shadowRoot.querySelector('#ds4svg'); 
    this.gyroSvg = this.shadowRoot.querySelector('#gyro_svg'); ;
    this.accelSvg = this.shadowRoot.querySelector('#accel_svg'); 
    this.setupSVGs();
    
    this.DS4 = new DualShock4();  
    // This will request the WebHID device and initialize the controller
    await this.DS4.init();    
    this.updateController();
  }
  
  updateController() {
    requestAnimationFrame(this.updateController.bind(this));
    this.update();
  }
  
  set lightBarColor(value) {
    this.DS4.lightbar.r = parseInt(value.substr(1,2), 16);
    this.DS4.lightbar.g = parseInt(value.substr(3,2), 16);
    this.DS4.lightbar.b = parseInt(value.substr(5,2), 16);
    this.DS4.sendLocalState();
  }
  
  set lightRumble(value) {
    this.DS4.rumble.light = value;
    this.DS4.sendLocalState();
  }
  
  set heavyRumble(value) {
    this.DS4.rumble.heavy = value;
    this.DS4.sendLocalState();
  }
  
  get state() {
    return this.DS4.state;
  }
  
  update() {
    if(!this.DS4)
      return;
    this.DS4.state.buttons.square ? this.squareShape.style.stroke = 'red' : this.squareShape.style.stroke = 'black';
    this.DS4.state.buttons.circle ? this.circleShape.style.stroke = 'red' : this.circleShape.style.stroke = 'black';
    this.DS4.state.buttons.cross ? this.crossShape1.style.stroke = 'red' : this.crossShape1.style.stroke = 'black';
    this.DS4.state.buttons.cross ? this.crossShape2.style.stroke = 'red' : this.crossShape2.style.stroke = 'black';
    this.DS4.state.buttons.triangle ? this.triangleShape.style.stroke = 'red' : this.triangleShape.style.stroke = 'black';
    
    this.DS4.state.buttons.dPadLeft ? this.dpadLeftShape.style.fill = 'red' : this.dpadLeftShape.style.fill = '';
    this.DS4.state.buttons.dPadRight ? this.dpadRightShape.style.fill = 'red' : this.dpadRightShape.style.fill = '';
    this.DS4.state.buttons.dPadUp ? this.dpadUpShape.style.fill = 'red' : this.dpadUpShape.style.fill = '';
    this.DS4.state.buttons.dPadDown ? this.dpadDownShape.style.fill = 'red' : this.dpadDownShape.style.fill = '';
    
    this.DS4.state.buttons.l1 ? this.l1Shape.style.fill = 'red' : this.l1Shape.style.fill = '';
    this.DS4.state.buttons.r1 ? this.r1Shape.style.fill = 'red' : this.r1Shape.style.fill = '';
    
    this.DS4.state.buttons.l3 ? this.l3Shape.style.stroke = 'red' : this.l3Shape.style.stroke = 'black';
    this.DS4.state.buttons.r3 ? this.r3Shape.style.stroke = 'red' : this.r3Shape.style.stroke = 'black';
    
    this.DS4.state.buttons.share ? this.shareShape.style.fill = 'red' : this.shareShape.style.fill = '';
    this.DS4.state.buttons.options ? this.optionsShape.style.fill = 'red' : this.optionsShape.style.fill = '';
    
    this.DS4.state.buttons.touchPadClick ? this.touchpadShape.style.stroke = 'red' : this.touchpadShape.style.stroke = '';    
    this.DS4.state.buttons.playStation ? this.playstationShape.style.fill = 'red' : this.playstationShape.style.fill = '';
    
    if(this.DS4.state.touchpad.touches && this.DS4.state.touchpad.touches.length > 0) {
      this.DS4.state.touchpad.touches.forEach((touch, i) => {
        if(i === 0) {
          this.touch1.style.fill = 'red';
          this.touch1.setAttribute('cx', 205 + touch.x / 10); 
          this.touch1.setAttribute('cy', 50 + touch.y / 10); 
        }
        else if(i === 1) {
          this.touch2.style.fill = 'red';
          this.touch2.setAttribute('cx', 205 + touch.x / 10); 
          this.touch2.setAttribute('cy', 50 + touch.y / 10); 
        }
      });      
    }
    else {
      this.touch1.style.fill = 'none';
      this.touch2.style.fill = 'none';
    }
    
    if(this.DS4.state.axes.rightStickX > 138 || this.DS4.state.axes.rightStickX < 118 || this.DS4.state.axes.rightStickY > 138 || this.DS4.state.axes.rightStickY < 118) {
      this.rightStickShape.style.fill = 'red'
      this.rightStickShape.setAttribute('transform', `translate( ${(this.DS4.state.axes.rightStickX - 128) / 10} , ${(this.DS4.state.axes.rightStickY - 128) / 10} )`);
    }
    else {
      this.rightStickShape.style.fill = ''
      this.rightStickShape.setAttribute('transform', `translate(0, 0)`);
    }
    
    if(this.DS4.state.axes.leftStickX > 138 || this.DS4.state.axes.leftStickX < 118 || this.DS4.state.axes.leftStickY > 138 || this.DS4.state.axes.leftStickY < 118) {
      this.leftStickShape.style.fill = 'red'
      this.leftStickShape.setAttribute('transform', `translate( ${(this.DS4.state.axes.leftStickX - 128) / 10} , ${(this.DS4.state.axes.leftStickY - 128) / 10} )`);
    }
    else {
      this.leftStickShape.style.fill = ''
      this.leftStickShape.setAttribute('transform', `translate(0, 0)`);
    }
    
    if(this.DS4.state.axes.l2 > 5) {
      this.lTrigger.style.fill = 'red' 
      this.lTrigger.setAttribute('r', this.DS4.state.axes.l2 / 5); 
    } 
    else
      this.lTrigger.style.fill = 'none';
    
    if(this.DS4.state.axes.r2 > 5) {
      this.rTrigger.style.fill = 'red' 
      this.rTrigger.setAttribute('r', this.DS4.state.axes.r2 / 5); 
    } 
    else
      this.rTrigger.style.fill = 'none';
    
    this.gxLine.setAttribute('y2', (65535 - this.DS4.state.axes.gyroX) / 1000 | 0);
    this.gyLine.setAttribute('y2', (65535 - this.DS4.state.axes.gyroY) / 1000 | 0);
    this.gzLine.setAttribute('y2', (65535 - this.DS4.state.axes.gyroZ) / 1000 | 0);
    
    this.axLine.setAttribute('y2', this.DS4.state.axes.accelX / -500 | 0);
    this.ayLine.setAttribute('y2', this.DS4.state.axes.accelY / -500 | 0);
    this.azLine.setAttribute('y2', this.DS4.state.axes.accelZ / -500 | 0);
  }  
  
  setupSVGs() {
    this.setupDS4SVG();
    this.setupGyroSVG();
    this.setupAccelSVG();
  }

  setupDS4SVG() {
    const svgDoc = this.ds4svg.contentDocument;
    svgDoc.getElementById('svg6306').setAttributeNS(null, 'height', 430);

    this.touchpadShape = svgDoc.getElementById('rect3842');
    this.playstationShape = svgDoc.getElementById('path3840');

    this.squareShape = svgDoc.getElementById('rect4554');
    this.triangleShape = svgDoc.getElementById('rect4554-1');
    this.circleShape = svgDoc.getElementById('path4552');
    this.crossShape1 = svgDoc.getElementById('path4532');
    this.crossShape2 = svgDoc.getElementById('path4532-0');

    this.dpadLeftShape = svgDoc.getElementById('rect4086-17');
    this.dpadRightShape = svgDoc.getElementById('rect4086-1');
    this.dpadUpShape = svgDoc.getElementById('rect4086-6');
    this.dpadDownShape = svgDoc.getElementById('rect4086');

    this.rightStickShape = svgDoc.getElementById('path4031-7');
    this.leftStickShape = svgDoc.getElementById('path4031');

    this.l1Shape = svgDoc.getElementById('rect4250');
    this.r1Shape = svgDoc.getElementById('rect4250-9');   

    this.l3Shape = svgDoc.getElementById('path4166-3-4-13-7');
    this.r3Shape = svgDoc.getElementById('path4166-3-4-13-7-1');    

    this.shareShape = svgDoc.getElementById('path2995');
    this.optionsShape = svgDoc.getElementById('path2995-7');

    const bodyShell = svgDoc.getElementById('g3324')

    this.touch1 = this.makeCircle(300, 100, 5, 'none', 'none', 1);
    this.touch2 = this.makeCircle(300, 100, 5, 'none', 'none', 1);
    bodyShell.appendChild(this.touch1);
    bodyShell.appendChild(this.touch2);
    this.bringToTopofSVG(this.touch1);
    this.bringToTopofSVG(this.touch2);

    this.lTrigger = this.makeCircle(130, 52, 0, 'none', 'none', 0.5);
    this.rTrigger = this.makeCircle(470, 52, 0, 'none', 'none', 0.5);
    bodyShell.appendChild(this.lTrigger);
    bodyShell.appendChild(this.rTrigger);
    this.bringToTopofSVG(this.lTrigger);
    this.bringToTopofSVG(this.rTrigger);
  }

  makeCircle(x, y, r, fill, stroke, opacity) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttributeNS(null, 'cx', x);
    circle.setAttributeNS(null, 'cy', y);
    circle.setAttributeNS(null, 'r', r);
    circle.setAttributeNS(null, 'style', `fill: ${fill}; stroke: ${stroke};`);
    circle.setAttributeNS(null, 'opacity', opacity);
    return circle;
  }

  bringToTopofSVG(targetElement){
    let parent = targetElement.ownerSVGElement;
    parent.appendChild(targetElement);
  }

  setupGyroSVG() {
    const svgDoc = this.gyroSvg.contentDocument;
    this.gxLine = svgDoc.getElementById('force_x');
    this.gyLine = svgDoc.getElementById('force_y');
    this.gzLine = svgDoc.getElementById('force_z');
    svgDoc.getElementById('text_title').textContent='Gyroscope';

    const svgElement = svgDoc.getElementById(2)
    this.ds4svg.contentDocument.getElementById('g3324').appendChild(svgElement);
    svgElement.setAttribute('transform', `translate(150, 260) scale(0.5)`);
  }

  setupAccelSVG() {
    const svgDoc = this.accelSvg.contentDocument;
    this.axLine = svgDoc.getElementById('force_x');
    this.ayLine = svgDoc.getElementById('force_y');
    this.azLine = svgDoc.getElementById('force_z');
    svgDoc.getElementById('text_title').textContent='Accelerometer';

    const svgElement = svgDoc.getElementById(2)
    this.ds4svg.contentDocument.getElementById('g3324').appendChild(svgElement);
    svgElement.setAttribute('transform', `translate(300, 260) scale(0.5)`);
  }
}
customElements.define('ps-controller', PSController);
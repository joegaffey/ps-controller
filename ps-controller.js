
import { DualShock4 } from './webhid-ds4.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
  .vector.text {
    user-select: none;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 24pt;      
    fill: #000000;
    text-anchor: middle; 
  }
  line, ellipse { 
    stroke: #000000;
    stroke-width: 2px;
  } 
  .force {
    stroke-width: 12px;
    stroke: #ff0000;
    stroke-linecap: round;
  }
  .hidden { visibility: hidden; }
</style>
<object id="ds4svg" type="image/svg+xml" data="ds4.svg"></object>
<div class="hidden">
  <object id="gyro_svg" class="vector" type="image/svg+xml" data="vectors.svg"></object>
  <object id="accel_svg" class="vector" type="image/svg+xml" data="vectors.svg"></object>
</div>   
`;

class PSController extends HTMLElement {  

  constructor() {
    super();
    
    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(template.content.cloneNode(true));
        
    this.ds4svg = this.shadowRoot.querySelector('#ds4svg');     
    this.gyroSvg = this.shadowRoot.querySelector('#gyro_svg'); ;
    this.accelSvg = this.shadowRoot.querySelector('#accel_svg'); 
    
    const loadSVGPromises = [
      new Promise((resolve) => { this.gyroSvg.onload = resolve; }),
      new Promise((resolve) => { this.ds4svg.onload = resolve; }),
      new Promise((resolve) => { this.accelSvg.onload = resolve; })
    ];
    Promise.all(loadSVGPromises).then(() => { this.setupSVGs(); });
    
    this.userState = this.getIinitalState();
    this.updateController();
  }
  
  setupSVGs() {
    this.setupDS4SVG();
    this.setupGyroSVG();
    this.setupAccelSVG();
  }
  
  async init () {   
    this.DS4 = new DualShock4();  
    // This will request the WebHID device and initialize the controller
    await this.DS4.init();
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
    if(!this.ds4svg.isSetUp) 
      return;
    
    let state = this.userState;
    if(this.DS4)
      state = this.DS4.state;
    
    state.buttons.square ? this.squareShape.style.stroke = 'red' : this.squareShape.style.stroke = 'black';
    state.buttons.circle ? this.circleShape.style.stroke = 'red' : this.circleShape.style.stroke = 'black';
    state.buttons.cross ? this.crossShape.style.stroke = 'red' : this.crossShape.style.stroke = 'black';
    state.buttons.triangle ? this.triangleShape.style.stroke = 'red' : this.triangleShape.style.stroke = 'black';
    
    state.buttons.dPadLeft ? this.dpadLeftShape.style.fill = 'red' : this.dpadLeftShape.style.fill = '';
    state.buttons.dPadRight ? this.dpadRightShape.style.fill = 'red' : this.dpadRightShape.style.fill = '';
    state.buttons.dPadUp ? this.dpadUpShape.style.fill = 'red' : this.dpadUpShape.style.fill = '';
    state.buttons.dPadDown ? this.dpadDownShape.style.fill = 'red' : this.dpadDownShape.style.fill = '';
    
    state.buttons.l1 ? this.l1Shape.style.fill = 'red' : this.l1Shape.style.fill = '';
    state.buttons.r1 ? this.r1Shape.style.fill = 'red' : this.r1Shape.style.fill = '';
    
    state.buttons.l3 ? this.l3Shape.style.stroke = 'red' : this.l3Shape.style.stroke = 'black';
    state.buttons.r3 ? this.r3Shape.style.stroke = 'red' : this.r3Shape.style.stroke = 'black';
    
    state.buttons.share ? this.shareShape.style.fill = 'red' : this.shareShape.style.fill = '';
    state.buttons.options ? this.optionsShape.style.fill = 'red' : this.optionsShape.style.fill = '';
    
    state.buttons.touchPadClick ? this.touchpadShape.style.stroke = 'red' : this.touchpadShape.style.stroke = '';    
    state.buttons.playStation ? this.playstationShape.style.fill = 'red' : this.playstationShape.style.fill = '';
    
    if(state.touchpad.touches && state.touchpad.touches.length > 0) {
      state.touchpad.touches.forEach((touch, i) => {
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
    
    if(state.axes.rightStickX > 138 || state.axes.rightStickX < 118 || state.axes.rightStickY > 138 || state.axes.rightStickY < 118) {
      this.rightStickShape.style.fill = 'red'
      this.rightStickShape.setAttribute('transform', `translate( ${(state.axes.rightStickX - 128) / 10} , ${(state.axes.rightStickY - 128) / 10} )`);
    }
    else {
      this.rightStickShape.style.fill = ''
      this.rightStickShape.setAttribute('transform', `translate(0, 0)`);
    }
    
    if(state.axes.leftStickX > 138 || state.axes.leftStickX < 118 || state.axes.leftStickY > 138 || state.axes.leftStickY < 118) {
      this.leftStickShape.style.fill = 'red'
      this.leftStickShape.setAttribute('transform', `translate( ${(state.axes.leftStickX - 128) / 10} , ${(state.axes.leftStickY - 128) / 10} )`);
    }
    else {
      this.leftStickShape.style.fill = ''
      this.leftStickShape.setAttribute('transform', `translate(0, 0)`);
    }
    
    if(state.axes.l2 > 5) {
      this.lTrigger.style.fill = 'red' 
      this.lTrigger.setAttribute('r', state.axes.l2 / 5); 
    } 
    else
      this.lTrigger.style.fill = 'none';
    
    if(state.axes.r2 > 5) {
      this.rTrigger.style.fill = 'red' 
      this.rTrigger.setAttribute('r', state.axes.r2 / 5); 
    } 
    else
      this.rTrigger.style.fill = 'none';
    
    if(this.gyroSvg.isSetUp) { 
      this.gxLine.setAttribute('y2', (65535 - state.axes.gyroX) / 1000 | 0);
      this.gyLine.setAttribute('y2', (65535 - state.axes.gyroY) / 1000 | 0);
      this.gzLine.setAttribute('y2', (65535 - state.axes.gyroZ) / 1000 | 0);
    }
    
    if(this.accelSvg.isSetUp) { 
      this.axLine.setAttribute('y2', state.axes.accelX / -500 | 0);
      this.ayLine.setAttribute('y2', state.axes.accelY / -500 | 0);
      this.azLine.setAttribute('y2', state.axes.accelZ / -500 | 0);
    }
  }  

  setupDS4SVG() {
    const svgDoc = this.ds4svg.contentDocument;
    svgDoc.getElementById('svg6306').setAttributeNS(null, 'height', 430);

    this.makeButtonInteractive(this.touchpadShape = svgDoc.getElementById('rect3842'), 'touchpad');
    this.makeButtonInteractive(this.playstationShape = svgDoc.getElementById('path3840'), 'playstation');

    this.makeButtonInteractive(this.squareShape = svgDoc.getElementById('rect4554'), 'square');
    this.makeButtonInteractive(this.triangleShape = svgDoc.getElementById('rect4554-1'), 'triangle');
    this.makeButtonInteractive(this.circleShape = svgDoc.getElementById('path4552'), 'circle');
    this.makeButtonInteractive(this.crossShape = svgDoc.getElementById('path3038-1'), 'cross');

    this.makeButtonInteractive(this.dpadLeftShape = svgDoc.getElementById('rect4086-17'), 'dpadLeft');
    this.makeButtonInteractive(this.dpadRightShape = svgDoc.getElementById('rect4086-1'), 'dpadRight');
    this.makeButtonInteractive(this.dpadUpShape = svgDoc.getElementById('rect4086-6'), 'dpadUp');
    this.makeButtonInteractive(this.dpadDownShape = svgDoc.getElementById('rect4086'), 'dpadDown');

    this.makeButtonInteractive(this.l1Shape = svgDoc.getElementById('rect4250'), 'l1');
    this.makeButtonInteractive(this.r1Shape = svgDoc.getElementById('rect4250-9'), 'r1');

    this.makeButtonInteractive(this.shareShape = svgDoc.getElementById('path2995'), 'share');
    this.makeButtonInteractive(this.optionsShape = svgDoc.getElementById('path2995-7'), 'options');
    
    this.makeButtonInteractive(this.leftStickShape = svgDoc.getElementById('path4031'), 'l3');
    this.makeButtonInteractive(this.rightStickShape = svgDoc.getElementById('path4031-7'), 'r3');    

    this.l3Shape = svgDoc.getElementById('path4166-3-4-13-7');
    this.r3Shape = svgDoc.getElementById('path4166-3-4-13-7-1');

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
    
    this.ds4svg.isSetUp = true;
  }
  
  makeButtonInteractive(element, state) {
    element.onpointerover = () => { 
      element.style.opacity = 0.5; 
    };     
    element.onpointerout = () => { 
      this.userState.buttons[state] = false;
      element.style.opacity = 1;
    };   
    element.onpointerdown = () => {
      this.userState.buttons[state] = true;
      element.style.opacity = 1;
    };
    element.onpointerup = () => {
      this.userState.buttons[state] = false;
      element.style.opacity = 0.5; 
    };
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

    const svgElement = svgDoc.getElementById('main');
    this.ds4svg.contentDocument.getElementById('g3324').appendChild(svgElement);
    svgElement.setAttribute('transform', `translate(150, 260) scale(0.5)`);
    
    this.gyroSvg.isSetUp = true;
  }

  setupAccelSVG() {
    const svgDoc = this.accelSvg.contentDocument;
    this.axLine = svgDoc.getElementById('force_x');
    this.ayLine = svgDoc.getElementById('force_y');
    this.azLine = svgDoc.getElementById('force_z');
    svgDoc.getElementById('text_title').textContent='Accelerometer';

    const svgElement = svgDoc.getElementById('main');
    this.ds4svg.contentDocument.getElementById('g3324').appendChild(svgElement);
    svgElement.setAttribute('transform', `translate(300, 260) scale(0.5)`);
    
    this.accelSvg.isSetUp = true;
  }
  
  getIinitalState() {
    return {
      interface: 'usb',
      axes: {
          leftStickX: 128,
          leftStickY: 128,
          rightStickX: 128,
          rightStickY: 128,
          l2: 0,
          r2: 0,
          gyroX: 30000,
          gyroY: 30000,
          gyroZ: 30000,
          accelX: -15000,
          accelY: -15000,
          accelZ: -15000
      },
      buttons: {
          triangle: false,
          circle: false,
          cross: false,
          square: false,
          dPadUp: false,
          dPadRight: false,
          dPadDown: false,
          dPadLeft: false,
          l1: false,
          r1: false,
          l2: false,
          r2: false,
          share: false,
          options: false,
          l3: false,
          r3: false,
          playStation: false,
          touchPadClick: false
      },
      touchpad: {
          touches: []
      },
      timestamp: 99999,
      charging: false,
      battery: 100
    };
  }
}
customElements.define('ps-controller', PSController);
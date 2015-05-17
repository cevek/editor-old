module Components {
    export var attrs = 'attrs';
    export var props = 'props';
}

function vd(tag:string):vd.Node;
function vd(tag:string, attrs:vd.Attrs):vd.Node;
function vd(tag:string, ...children:vd.Children[]):vd.Node;
function vd(tag:string, attrs:vd.Attrs, ...children:vd.Children[]):vd.Node;
function vd(attrs:vd.Attrs, ...children:vd.Children[]):vd.Node;
function vd(attrs:vd.Attrs):vd.Node;
function vd(...children:vd.Children[]):vd.Node;
function vd(...children:any[]):vd.Node {
    let tag:string;
    let attrs:vd.Attrs = {};
    let events:vd.Events;
    let key:string;
    let classes:string[] = [];
    if (typeof children[0] === 'string') {
        tag = <any>children.shift();
        let chunks = tag.split('.');
        tag = chunks.shift() || 'div';
        classes = chunks;
    }
    if (typeof children[0] === 'object' && children[0].children === void 0 && children[0].tag === void 0) {
        attrs = <any>children.shift();
        if (attrs.class) {
            classes.push(attrs.class);
        }

        if (attrs.events) {
            events = attrs.events;
            attrs.events = void 0;
        }
        if (attrs.key) {
            key = attrs.key;
            attrs.key = void 0;
        }
        if (attrs.classes) {
            let keys = Object.keys(attrs.classes);
            for (key of keys) {
                if (attrs.classes[key]) {
                    classes.push(key);
                }
            }
            attrs.classes = void 0;
        }
        if (attrs.style) {
            let keys = Object.keys(attrs.style);
            let newStyle:{[index:string]:string | number} = {};
            for (let key of keys) {
                let kkey = key.replace(/([A-Z])/g, m => '-' + m.toLowerCase());
                newStyle[kkey] = attrs.style[key];
            }
            attrs.style = newStyle;
        }
        let keys = Object.keys(attrs);
        let newAttrs:vd.Attrs = {};
        for (let key of keys) {
            if (attrs[key] !== void 0) {
                var newKey = key.replace(/([A-Z])/g, m => '-' + m.toLowerCase());
                newAttrs[newKey] = attrs[key];
            }
        }
        attrs = newAttrs;
    }
    attrs.class = classes.join(' ');
    return new vd.Node(tag, attrs, key, events, null, children);
}
module vd {
    export interface Events {
        [name: string]: ((e:Event)=>void);
        click?:((e:MouseEvent)=>void);
        mousedown?:((e:MouseEvent)=>void);
        mouseup?:((e:MouseEvent)=>void);
        mouseenter?:((e:MouseEvent)=>void);
        mouseleave?:((e:MouseEvent)=>void);
        mousemove?:((e:MouseEvent)=>void);
        keydown?:((e:KeyboardEvent)=>void);
        keyup?:((e:KeyboardEvent)=>void);
        keypress?:((e:KeyboardEvent)=>void);
    }

    export function extend(obj:Attrs, to:Attrs):Attrs {
        if (obj && typeof obj == 'object' && to) {
            for (let i = 0, keys = Object.keys(obj); i < keys.length; i++) {
                let key = keys[i];
                to[key] = extend(obj[key], to[key]);
            }
        }
        else {
            to = obj;
        }
        return to;
    }

    export class Node {
        constructor(public tag:string,
                    public attrs:Attrs,
                    public key:string,
                    public events:Events,
                    public component:Component1<Attrs>,
                    public children:Children[]) {

        }
    }

    type Children0 = Node | string;
    type Children1 = Children0 | Children0[];
    type Children2 = Children1 | Children1[];
    type Children3 = Children2 | Children2[];
    export type Children = Children3 | Children3[];
    export interface Attrs {
        id?: string;
        class?: string;
        style?: {[index:string]:string | number};
        events?: Events;
        key?: string;
        classes?: {[index:string]: boolean};
        [index:string]:any;
    }

    export function render(fn:()=>vd.Node) {
        var oldNode:vd.Node;
        var newNode:vd.Node;
        return observer.watch(()=> {
            newNode = fn();
            if (oldNode) {
                cito.vdom.update(oldNode, newNode);
            }
            else {
                cito.vdom.create(newNode);
            }
            oldNode = newNode;
        });

    }

    export function element(cls:new ()=>void, attrs:Attrs, children:Children[]):Node {
        return null;
    }

}

declare module cito.vdom {
    export function create(newNode:vd.Node):void;

    export function update(oldNode:vd.Node, newNode:vd.Node):void;

    export function append(dom:Node, newNode:vd.Node):void;

    export function remove(oldNode:vd.Node):void;
}

function prop(proto:any, name:string) {
    console.log("prop", proto, name);
    observe(proto, name);
    proto.constructor[Components.props] = proto.constructor[Components.props] || [];
    proto.constructor[Components.props].push(name);
}

function attr(proto:any, name:string) {
    console.log("attr", proto, name);
    observe(proto, name);
    proto.constructor[Components.attrs] = proto.constructor[Components.attrs] || [];
    proto.constructor[Components.attrs].push(name);

}

class Model {
    name:string;
}
class Component1<T extends vd.Attrs> {
    attrs:T;
    children:vd.Children[] = [];
    transparent = false;
    rootNode:vd.Node;

    get className() {
        return (<string>(<any>this.constructor).name).replace(/([A-Z]+)/g,
                m => '-' + m).replace(/^-+/, '').toLowerCase();
    }

    componentDidMount():void {}

    componentWillUnmount():void {}

    protected render():vd.Node {return null}

    runRender() {
        return this.rootNode = this.render();
    }

    private dependencyObserver() {
        var newNode = this.render();
        //(<any>cito.vdom).updateChildren(this.rootNode, newNode);
        //(<any>cito.vdom).update(this.currentVNodeState, newNode);
        //this.rootNode.children = newNode ? [newNode] : null;

        //cito.vdom.update(this.rootNode.children, newNode);
        if (!newNode) {
            newNode = new vd.Node('#', null, null, {}, this, ['']);
        }
        if (!newNode.events) {
            newNode.events = {};
        }
        newNode.events['$created'] = ()=>this.componentDidMount();
        newNode.events['$destroyed'] = ()=>this.componentWillUnmount();
        newNode.component = this;

        if (this.rootNode) {
            cito.vdom.update(this.rootNode, newNode);
        }
        else {
            cito.vdom.create(newNode);
        }

        this.rootNode = newNode;
        //this.rootNode.children = [newNode];
    }

    vd(attrs?:T, ...children:vd.Children[]) {
        this.attrs = attrs;
        this.children = children;
        observer.watch(this.dependencyObserver, this);
        return this.rootNode;
    }
}

class DefaultComponent extends Component1<vd.Attrs> {

}

interface NFFAttrs extends vd.Attrs {
    model:Model;
    title:string;
}

class NFF extends Component1<NFFAttrs> {

    @observe content = 'hello';

    componentDidMount():void {
        console.log("onAttached");
    }

    componentWillUnmount():void {
        console.log("onDetached");
    }

    render() {
        console.log("render");
        //var m = this.attrs.model;
        //var t = this.attrs.title;
        return vd('div', this.content);
    }
}

class FFT extends Component1<vd.Attrs> {
    render():vd.Node {
        return Math.random() > 0.5 ? new NFF().vd({model: {name: '234'}, title: 'eweads'}) : null;
    }
}

interface HTMLElement {
    component: Component1<vd.Attrs>;
}

var fft = new FFT().vd({});

cito.vdom.append(document.body, fft);
//document.body.appendChild(fft);
//var comp = fft.component;

function Component(name:string) {
    return function (target:new ()=>void) {
        var proto:{[index:string]:PropertyDescriptor} = {
            createdCallback: {
                value: function createdCallback() {
                    var el = this;
                    var component:Component1<vd.Attrs> = <any>new target();
                    var oldNode:vd.Node;
                    var newNode:vd.Node;

                    function dependencyObserver() {
                        newNode = (<any>component).render();
                        if (oldNode) {
                            cito.vdom.update(oldNode, newNode);
                        }
                        else {
                            cito.vdom.append(el, newNode);
                        }
                        component.rootNode = newNode;
                    }

                    observer.watch(dependencyObserver);
                    this.component = component;

                    var attrs = <string[]>(<any>target)[Components.attrs];
                    if (attrs) {
                        attrs.forEach(attr => {
                            this.component[attr] = el.getAttribute(attr);
                        });
                    }

                    console.log('here I am ^_^ ');
                    console.log('with content: ', this.textContent);
                }
            },
            attachedCallback: {
                value: function attachedCallback() {
                    var el = this;
                    var comp = <Component1<vd.Attrs>>this.component;
                    if (comp.componentDidMount) {
                        comp.componentDidMount();
                    }
                    console.log('live on DOM ;-) ');
                }
            },
            detachedCallback: {
                value: function detachedCallback() {
                    var comp = <Component1<vd.Attrs>>this.component;
                    if (comp.componentWillUnmount) {
                        comp.componentWillUnmount();
                    }
                    console.log('leaving the DOM :-( )');
                }
            },
            attributeChangedCallback: {
                value: function attributeChangedCallback(name:string, previousValue:string, value:string) {
                    var comp = <Component1<vd.Attrs>>this.component;
                    cito.vdom.update(this.component.rootNode, this.component.runRender());
                    /*
                                        if (comp.onAttributeChanged) {
                                            comp.onAttributeChanged(name, previousValue, value);
                                        }
                    */
                    this.component[name] = value;
                }
            }
        };

        (<any>document).registerElement(name, {
            prototype: Object.create(HTMLElement.prototype, proto)
        });
    }
}
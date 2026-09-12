export const OVERLAY_ELEMENT_TYPES=["text","image","video","rectangle","gradient","social_handle","logo","player_name","sponsor_slot","clock","live_viewers"] as const;
export type OverlayElementType=(typeof OVERLAY_ELEMENT_TYPES)[number];
export type OverlayElement={id:string;type:OverlayElementType;x:number;y:number;width:number;height:number;rotation?:number;zIndex:number;opacity?:number;text?:string;binding?:string;assetUrl?:string;color?:string;background?:string;fontSize?:number;textAlign?:"left"|"center"|"right";animation?:"none"|"fade"|"slide"|"pulse"};
export type OverlayConfig={canvas:{width:number;height:number;background?:string};elements:OverlayElement[]};
const bindings=new Set(["player.display_name","player.social.x","player.social.twitch","stream.viewer_count","stream.game_name","stream.title","organization.name","runtime.message","runtime.current_sponsor"]);
function finite(value:unknown,min:number,max:number){return typeof value==="number"&&Number.isFinite(value)&&value>=min&&value<=max}
export function validateOverlayConfig(input:unknown):{valid:true;config:OverlayConfig}|{valid:false;errors:string[]}{
 const errors:string[]=[];
 if(!input||typeof input!=="object")return{valid:false,errors:["config_object_required"]};
 const data=input as Partial<OverlayConfig>;
 if(!data.canvas||!finite(data.canvas.width,320,7680)||!finite(data.canvas.height,240,4320))errors.push("invalid_canvas");
 if(!Array.isArray(data.elements)||data.elements.length>100)errors.push("invalid_elements");
 else{const ids=new Set<string>();for(const element of data.elements){
  if(!element||typeof element!=="object"||typeof element.id!=="string"||!/^[a-zA-Z0-9_-]{1,80}$/.test(element.id)||ids.has(element.id))errors.push("invalid_element_id");else ids.add(element.id);
  if(!OVERLAY_ELEMENT_TYPES.includes(element.type))errors.push("unknown_element");
  for(const[key,value,min,max]of[["x",element.x,-7680,7680],["y",element.y,-4320,4320],["width",element.width,1,7680],["height",element.height,1,4320],["zIndex",element.zIndex,0,1000]] as const)if(!finite(value,min,max))errors.push(`invalid_${key}`);
  if(element.rotation!==undefined&&!finite(element.rotation,-360,360))errors.push("invalid_rotation");
  if(element.opacity!==undefined&&!finite(element.opacity,0,1))errors.push("invalid_opacity");
  if(element.fontSize!==undefined&&!finite(element.fontSize,6,500))errors.push("invalid_font_size");
  if(element.text&&(/[<>]/.test(element.text)||element.text.length>1000))errors.push("unsafe_text");
  if(element.binding&&!bindings.has(element.binding))errors.push("private_binding");
  if(element.assetUrl){try{const url=new URL(element.assetUrl);if(url.protocol!=="https:"||!url.hostname.endsWith(".supabase.co")||!url.pathname.includes("/storage/v1/object/public/overlays/")||!/\.(png|jpe?g|webp|mp4|webm)$/i.test(url.pathname))errors.push("unsafe_asset_url")}catch{errors.push("unsafe_asset_url")}}
  if(element.background&&/url\s*\(|javascript:|expression\s*\(/i.test(element.background))errors.push("unsafe_background");
 }}
 return errors.length?{valid:false,errors:[...new Set(errors)]}:{valid:true,config:data as OverlayConfig};
}
export function parseOverlayConfig(value:string){if(value.length>200_000)return{valid:false,errors:["config_too_large"]}as const;try{return validateOverlayConfig(JSON.parse(value))}catch{return{valid:false,errors:["malformed_json"]}as const}}
export const EMPTY_OVERLAY_CONFIG:OverlayConfig={canvas:{width:1920,height:1080,background:"transparent"},elements:[]};

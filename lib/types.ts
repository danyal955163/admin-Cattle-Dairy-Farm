export type Role='admin'|'staff'|'viewer';
export type OrderStatus='pending'|'confirmed'|'preparing'|'dispatched'|'delivered'|'cancelled';
export interface Livestock{ id:string; tag:string; name:string; category:string; breed:string; gender:string; age:number; weight:number; status:'available'|'reserved'|'sold'; price:number; featured:boolean; health:string }
export interface MilkProduct{ id:string; name:string; type:'cow'|'buffalo'; price:number; available:boolean; stockLiters:number }
export interface Order{ id:string; customer:string; phone:string; date:string; status:OrderStatus; liters:number; amount:number; payment:'pending'|'paid'|'not_applicable' }
export interface MarketplacePost{ id:string; title:string; seller:string; category:string; location:string; status:'pending'|'approved'|'rejected'; submitted:string }
export interface Activity{ id:string; title:string; detail:string; time:string; tone:'green'|'amber'|'slate' }

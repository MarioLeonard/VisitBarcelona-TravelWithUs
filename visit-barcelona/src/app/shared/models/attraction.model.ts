export interface Attraction {
  id: string;           
  name: string;         
  category: string;     
  district: string;     
  rating: number;       
  visited: boolean;     
  description: string;  
  lat: number;          
  lng: number;          
  imageUrl?: string;    
  addedDate: Date;      
}

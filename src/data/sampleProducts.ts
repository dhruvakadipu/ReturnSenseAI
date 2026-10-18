import { Product } from '../types';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'PRD-KURTI-01',
    name: 'Ananya Handloom Pure Cotton Straight Kurti - Mustard Yellow',
    sku: 'AN-KUR-MST-2026',
    category: "Women's Ethnic Wear",
    price: 799,
    listing_description:
      '100% Pure Cambric Cotton straight cut ethnic kurti with elegant boat neckline, 3/4 sleeves, and side slits. Features subtle foil print work on yoke and sleeve borders. Perfect for daily office wear and festive family gatherings. Regular comfortable fit as per Indian size standards.',
    fabric_details: '100% Cambric Cotton (60s count), pre-shrunk, soft enzyme washed',
    monthly_orders: 1450,
    current_return_rate: 0.328, // 32.8% return rate
    listing_image_url:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80',
    size_chart: {
      headers: ['Size', 'Bust (in)', 'Waist (in)', 'Shoulder (in)', 'Length (in)'],
      rows: [
        { Size: 'S', 'Bust (in)': '36', 'Waist (in)': '32', 'Shoulder (in)': '14.0', 'Length (in)': '44' },
        { Size: 'M', 'Bust (in)': '38', 'Waist (in)': '34', 'Shoulder (in)': '14.5', 'Length (in)': '44' },
        { Size: 'L', 'Bust (in)': '40', 'Waist (in)': '36', 'Shoulder (in)': '15.0', 'Length (in)': '44' },
        { Size: 'XL', 'Bust (in)': '42', 'Waist (in)': '38', 'Shoulder (in)': '15.5', 'Length (in)': '45' },
        { Size: 'XXL', 'Bust (in)': '44', 'Waist (in)': '40', 'Shoulder (in)': '16.0', 'Length (in)': '45' },
      ],
      notes:
        'Standard regular fit. Note: Actual production garments run 1.5 - 2 inches tighter in bust and armholes due to grading variance, which is the hidden root cause of sizing returns.',
    },
  },
  {
    id: 'PRD-SAREE-02',
    name: 'Virasat Banarasi Kanjivaram Silk-Blend Saree with Zari Border - Royal Peacock Blue',
    sku: 'VR-SAR-PCK-501',
    category: 'Sarees & Occasion Wear',
    price: 1899,
    listing_description:
      'Traditional Banarasi Silk-blend jacquard woven saree with opulent golden metallic zari border and elaborate pallu. Comes with an unstitched heavy brocade blouse piece (0.8m). Vibrant royal peacock blue colour gives a regal glow under lights, ideal for wedding receptions, pujas and festivals.',
    fabric_details: 'Art Silk (Poly-viscose jacquard blend) with gold lurex metallic zari yarn',
    monthly_orders: 980,
    current_return_rate: 0.274, // 27.4% return rate
    listing_image_url:
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=80',
    size_chart: {
      headers: ['Component', 'Length', 'Width', 'Blouse Piece', 'Care'],
      rows: [
        {
          Component: 'Saree with Blouse',
          Length: '5.5 Meters',
          Width: '1.14 Meters (44 inch)',
          'Blouse Piece': '0.80 Meters (Unstitched)',
          Care: 'Dry Clean Only',
        },
      ],
      notes:
        'One-size traditional drape. Note: Catalog studio photography was taken under intense 6500K cool-white studio lights with saturation boosted, making it look luminous electric cyan-peacock, whereas the real garment in home ambient light is a muted dark ink navy teal.',
    },
  },
  {
    id: 'PRD-KURTA-03',
    name: 'Aarav Casual Short Kurta for Men - Indigo Blue',
    sku: 'AR-KRT-IND-108',
    category: "Men's Ethnic Wear",
    price: 949,
    listing_description:
      "Men's 100% Pure Khadi Cotton short ethnic kurta with mandarin band collar, functional wooden buttons, and roll-up sleeves. Ultra-breathable, sweat-absorbent, all-natural handloom feel for Indian summers and casual Friday ethnic looks.",
    fabric_details: 'Claimed: 100% Pure Khadi Cotton. Actual: 65% Cotton, 35% Synthetic Polyester blend',
    monthly_orders: 1220,
    current_return_rate: 0.252, // 25.2% return rate
    listing_image_url:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80',
    size_chart: {
      headers: ['Size', 'Chest (in)', 'Shoulder (in)', 'Kurta Length (in)', 'Sleeve (in)'],
      rows: [
        { Size: 'M', 'Chest (in)': '40', 'Shoulder (in)': '17.5', 'Kurta Length (in)': '29', 'Sleeve (in)': '24.5' },
        { Size: 'L', 'Chest (in)': '42', 'Shoulder (in)': '18.0', 'Kurta Length (in)': '30', 'Sleeve (in)': '25.0' },
        { Size: 'XL', 'Chest (in)': '44', 'Shoulder (in)': '18.5', 'Kurta Length (in)': '31', 'Sleeve (in)': '25.5' },
        { Size: 'XXL', 'Chest (in)': '46', 'Shoulder (in)': '19.0', 'Kurta Length (in)': '32', 'Sleeve (in)': '26.0' },
      ],
      notes:
        'Regular comfort fit. Note: Sizing is generally true to size, but buyers expect 100% pure organic khadi cotton and feel cheated by synthetic polyester shine & lack of sweat absorption, plus a specific manufacturing batch (B-204) had loose collar threads.',
    },
  },
];

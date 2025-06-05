export interface Listing {
  id: string
  brand: string
  price: number
  image: string
  filter: 'Riided' | 'Aksessuaarid' | 'Jalanõud' | 'Sport' | 'Ilu'
  category: string // nt Mantlid, Joped, Püksid jms
  size?: string    // valikuline
}

export const mockListings: Listing[] = [
  {
    id: '1',
    brand: 'Vélla',
    price: 79,
    image: '/images/mockImage/aluspesu.png',
    filter: 'Riided',
    category: 'Aluspesu',
    size: 'M',
  },
  {
    id: '2',
    brand: 'Stride & Co.',
    price: 45,
    image: '/images/mockImage/mantel.png',
    filter: 'Riided',
    category: 'Mantlid',
    size: 'L',
  },
  {
    id: '3',
    brand: 'ReNova',
    price: 20,
    image: '/images/mockImage/pusa.png',
    filter: 'Riided',
    category: 'Üleriided',
    size: 'S',
  },
  {
    id: '4',
    brand: 'Lume Luxe',
    price: 130,
    image: '/images/mockImage/kaelakee.png',
    filter: 'Aksessuaarid',
    category: 'Ehted',
    // size puudub
  },
  {
    id: '5',
    brand: 'Pacer Originals',
    price: 130,
    image: '/images/mockImage/kott.png',
    filter: 'Aksessuaarid',
    category: 'Kotid',
    // size puudub
  },
]

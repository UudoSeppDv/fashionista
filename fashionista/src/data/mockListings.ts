export const mockListings = [
  {
    id: '1',
    title: 'Vélla',
    price: 79,
    image: '/images/mockImage/aluspesu.png',
    category: 'Aluspesu',
    size: 'M',           // lisatud size
  },
  {
    id: '2',
    title: 'Stride & Co.',
    price: 45,
    image: '/images/mockImage/mantel.png',
    category: 'Mantlid',
    size: 'L',           // lisatud size
  },
  {
    id: '3',
    title: 'ReNova',
    price: 20,
    image: '/images/mockImage/pusa.png',
    category: 'Pusad',
    size: 'S',           // lisatud size
  },
  {
    id: '4',
    title: 'Lume Luxe',
    price: 130,
    image: '/images/mockImage/kaelakee.png',
    category: 'Ehted',
    // size puudub, sest ei ole riideese
  },
  {
    id: '5',
    title: 'Pacer Originals',
    price: 130,
    image: '/images/mockImage/kott.png',
    category: 'Kotid',
    // size puudub, sest ei ole riideese
  },
]

export interface Listing {
  id: string
  title: string
  price: number
  image: string
  category: string
  size?: string    // size on nüüd valikuline
}

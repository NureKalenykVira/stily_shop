export type Product = {
  id: number;
  name: string;
  price: number;
  images: string[];
  colors: string[];
  sizes: string[];
  sku?: string;
  fabric?: string[];
  [key: string]: any;
};

export const products: Product[] = [
  {
    id: 1,
    name: 'Шорти',
    price: 1100,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'ХXL', 'ХХXL'],
    type: 'Шорти',
    color: 'Чорний',
    colors: ['#000000'],
    images: ['assets/product/test-3.jpg', 'assets/product/test-4.jpg'],
    sku: 'NFOA8CPPV7N1',
    fabric: ['95% бавовна', '5% еластан']
  },
  {
    id: 2,
    name: 'Штани лляні бежеві',
    price: 750,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'ХXL', 'ХХXL'],
    type: 'Штани',
    color: 'Бежевий',
    colors: ['#e6e0d4'],
    images: ['assets/product/test-5.jpg', 'assets/product/test-6.jpg'],
    sku: 'LLINBEZH02',
    fabric: ['100% льон']
  },
  {
    id: 3,
    name: 'Футболка Classic Grey',
    price: 750,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'ХXL', 'ХХXL'],
    type: 'Футболка',
    color: 'Світло-коричневий',
    colors: ['#a79b8e', '#000000'],
    images: ['assets/product/test-7.jpg', 'assets/product/test-8.jpg'],
    sku: 'FCLGREY03',
    fabric: ['90% бавовна', '10% поліестер']
  },
  {
    id: 4,
    name: 'Футболка Classic Grey',
    price: 750,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'ХXL', 'ХХXL'],
    type: 'Футболка',
    color: 'Чорний',
    colors: ['#000000', '#a79b8e'],
    images: ['assets/product/test-9.jpg', 'assets/product/test-10.jpg'],
    sku: 'FCLBLACK04',
    fabric: ['95% бавовна', '5% лайкра']
  },
  {
    id: 5,
    name: 'Штани Classic Grey',
    price: 750,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    type: 'Штани',
    color: 'Світло-сірий',
    colors: ['#dcdcdc'],
    images: ['assets/product/test-11.jpg', 'assets/product/test-12.jpg'],
    sku: 'PCLGREY05',
    fabric: ['70% бавовна', '30% поліестер']
  },
  {
    id: 6,
    name: 'Сорочка Nike M NSW Club',
    price: 1099,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    type: 'Сорочка',
    color: 'Чорний',
    colors: ['#000000', '#ffffff'],
    images: ['assets/product/test-1.png', 'assets/product/test-2.jpg'],
    sku: 'NKMSWCLUB06',
    fabric: ['80% бавовна', '20% поліестер']
  },
  {
    id: 7,
    name: 'Худі Classic Grey',
    price: 750,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    type: 'Худі',
    color: 'Темно-синій',
    colors: ['#1b1f2b'],
    images: ['assets/product/test-13.jpg', 'assets/product/test-14.jpg'],
    sku: 'HDCLGREY07',
    fabric: ['65% бавовна', '35% поліестер']
  },
  {
    id: 8,
    name: 'Поло молочне',
    price: 750,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    type: 'Поло',
    color: 'Молочний',
    colors: ['#f5f5f0'],
    images: ['assets/product/test-15.jpg', 'assets/product/test-16.jpg'],
    sku: 'POLMILK08',
    fabric: ['60% бавовна', '40% поліестер']
  },
  {
    id: 9,
    name: 'Футболка зелена',
    price: 750,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    type: 'Футболка',
    color: 'Зелений',
    colors: ['#1f4d3a'],
    images: ['assets/product/test-17.jpg', 'assets/product/test-18.jpg'],
    sku: 'FGREEN09',
    fabric: ['100% бавовна']
  },
  {
    id: 10,
    name: 'Штани Classic Grey',
    price: 750,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    type: 'Штани',
    color: 'Сірий меланж',
    colors: ['#bcbcbc'],
    images: ['assets/product/test-19.jpg', 'assets/product/test-20.jpg'],
    sku: 'PCLGREY10',
    fabric: ['85% бавовна', '15% поліестер']
  }
];

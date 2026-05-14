/* ═══════════════════════════════════════
   DATA
═══════════════════════════════════════ */
const MENU={
  'South Indian':[
    {id:'si1',name:'Classic Masala Dosa',price:159},
    {id:'si2',name:'Plain Dosa',price:139},
    {id:'si3',name:'Paneer Dosa',price:189},
    {id:'si4',name:'Onion Dosa',price:169},
    {id:'si5',name:'Paneer Cheese Dosa',price:219},
    {id:'si6',name:'Masala Cheese Dosa',price:209},
    {id:'si7',name:'Idli (4pcs) with Sambar',price:189},
    {id:'si8',name:'Masala Idli with Sambar',price:199},
    {id:'si9',name:'Only Sambar',price:99},
    {id:'si10',name:'Idli (2pcs)',price:79},
    {id:'si11',name:'Double Roast Uthappa',price:179}
  ],
  'Burger':[
    {id:'b1',name:'Aloo Tikki Burger',price:99},
    {id:'b2',name:'Aloo Tikki Cheese Burger',price:109},
    {id:'b3',name:'Veg Double Cheese Burger',price:129},
    {id:'b4',name:'Grilled Paneer Burger',price:159},
    {id:'b5',name:'Double Open Burger',price:179}
  ],
  'Sandwiches':[
    {id:'sa1',name:'Corn Cheese Grilled Sandwich',price:179},
    {id:'sa2',name:'Paneer Tikka Grilled Sandwich',price:199},
    {id:'sa3',name:'English Grilled Veg Sandwich',price:199},
    {id:'sa4',name:'Veg Grilled Sandwich',price:189},
    {id:'sa5',name:'Bombay Masala Grilled Sandwich',price:189},
    {id:'sa6',name:'Grilled Mushroom Sandwich',price:189}
  ],
  'Indian Main Course':[
    {id:'imc1',name:'Paneer Butter Masala',price:279},
    {id:'imc2',name:'Paneer Rogan Josh',price:299},
    {id:'imc3',name:'Paneer Kadai',price:299},
    {id:'imc4',name:'Paneer Lababdar',price:289},
    {id:'imc5',name:'Paneer Khurchan',price:289},
    {id:'imc6',name:'Paneer Makhani',price:289},
    {id:'imc7',name:'Paneer Handi',price:289},
    {id:'imc8',name:'Paneer Methi Malai',price:299},
    {id:'imc9',name:'Heeng Jeera Ke Chatpate Aloo',price:199},
    {id:'imc10',name:'Mix Vegetable',price:219},
    {id:'imc11',name:'Subz Kolhapuri',price:229},
    {id:'imc12',name:'Palak Paneer',price:249},
    {id:'imc13',name:'Shahi Paneer',price:269},
    {id:'imc14',name:'Paneer Do Pyaza',price:269},
    {id:'imc15',name:'Mushroom Do Pyaza',price:269},
    {id:'imc16',name:'Mushroom Masala',price:279}
  ],
  'Tandoori Breads':[
    {id:'tb1',name:'Plain Roti',price:29},
    {id:'tb2',name:'Butter Roti',price:39},
    {id:'tb3',name:'Missi Roti',price:59},
    {id:'tb4',name:'Lachha Paratha',price:59},
    {id:'tb5',name:'Hari Mirch Paratha',price:79},
    {id:'tb6',name:'Plain Naan',price:69},
    {id:'tb7',name:'Butter Naan',price:79},
    {id:'tb8',name:'Garlic Naan',price:99},
    {id:'tb9',name:'Onion Kulcha',price:99},
    {id:'tb10',name:'Aloo Kulcha',price:99},
    {id:'tb11',name:'Paneer Kulcha',price:99},
    {id:'tb12',name:'Mix Stuffed Kulcha',price:119},
    {id:'tb13',name:'Amritsar Kulcha',price:99},
    {id:'tb14',name:'Masala Cheese Naan',price:119},
    {id:'tb15',name:'Add On (Green Chilli / Garlic / Pudina / Onion)',price:10}
  ],
  'Dal':[
    {id:'d1',name:'Dal Fry',price:199},
    {id:'d2',name:'Dal Tadka',price:209},
    {id:'d3',name:'Dal Dhaba',price:209},
    {id:'d4',name:'Dal Makhani',price:259}
  ],
  'Rice & Biryani':[
    {id:'rb1',name:'Steamed Rice',price:149},
    {id:'rb2',name:'Jeera Rice',price:159},
    {id:'rb3',name:'Onion Jeera Rice',price:169},
    {id:'rb4',name:'Peas Pulao',price:169},
    {id:'rb5',name:'Corn Masala Pulao',price:179},
    {id:'rb6',name:'Paneer Pulao',price:179},
    {id:'rb7',name:'Navratan Pulao',price:199},
    {id:'rb8',name:'Veg Dum Biryani',price:289},
    {id:'rb9',name:'Hyderabadi Biryani',price:289},
    {id:'rb10',name:'Paneer Tikka Biryani',price:299}
  ],
  'Chinese Rice & Noodles':[
    {id:'cn1',name:'Hakka Noodles',price:199},
    {id:'cn2',name:'Burn Chilli Garlic Noodles',price:219},
    {id:'cn3',name:'Schezwan Noodles',price:219},
    {id:'cn4',name:'Singapore Noodles',price:229},
    {id:'cn5',name:'Veg Fried Rice',price:199},
    {id:'cn6',name:'Singapore Fried Rice',price:229},
    {id:'cn7',name:'Schezwan Fried Rice',price:219},
    {id:'cn8',name:'Corn & Mushroom Fried Rice',price:239},
    {id:'cn9',name:'Paneer Fried Rice',price:229}
  ],
  'Clay Oven Starter':[
    {id:'cos1',name:'Veg Seekh Kebab (8pcs)',price:249},
    {id:'cos2',name:'Rajasthani Paneer Tikka (8pcs)',price:279},
    {id:'cos3',name:'Malai Paneer Tikka (8pcs)',price:299},
    {id:'cos4',name:'Achari Paneer Tikka (8pcs)',price:289},
    {id:'cos5',name:'Mushroom Tikka (14pcs)',price:299},
    {id:'cos6',name:'Tandoori Soya Chaap (10pcs)',price:269},
    {id:'cos7',name:'Achari Soya Chaap (10pcs)',price:279},
    {id:'cos8',name:'Malai Chaap (10pcs)',price:289},
    {id:'cos9',name:'Classic Dahi Ke Kebab (8pcs)',price:299},
    {id:'cos10',name:'Hara Bhara Kebab (8pcs)',price:289},
    {id:'cos11',name:'Stuffed Tandoori Mushroom (10pcs)',price:299}
  ],
  'Sizzler':[
    {id:'sz1',name:'Cottage Cheese Sizzler',price:359},
    {id:'sz2',name:'Chinese Sizzler',price:359},
    {id:'sz3',name:'Mexican Sizzler',price:359},
    {id:'sz4',name:'Kebab Sizzler',price:379}
  ],
  'Platter':[
    {id:'pl1',name:'Tandoori Veg Platter (15pcs)',price:499},
    {id:'pl2',name:'Chinese Platter',price:549}
  ],
  'Continental Munchies':[
    {id:'cm1',name:'French Fries',price:129},
    {id:'cm2',name:'Peri Peri French Fries',price:149},
    {id:'cm3',name:'Plain Garlic Bread (4pcs)',price:129},
    {id:'cm4',name:'Cheese Garlic Bread (4pcs)',price:179},
    {id:'cm5',name:'Mexican Loaded Nachos',price:179},
    {id:'cm6',name:'Corn Cheese Bruschetta',price:199},
    {id:'cm7',name:'Mushroom Cheese Bruschetta',price:209},
    {id:'cm8',name:'Corn & Bell Peppers Bruschetta',price:219},
    {id:'cm9',name:'Mushroom & Bell Peppers Bruschetta',price:219}
  ],
  'Continental':[
    {id:'co1',name:'Corn Cheese Ball',price:249},
    {id:'co2',name:'Mexican Quesadilla',price:219},
    {id:'co3',name:'Baked Mushroom Cap',price:249},
    {id:'co4',name:'Grilled Cottage Cheese Quesadilla',price:239}
  ],
  'Pasta':[
    {id:'ps1',name:'Creamy Alfredo',price:249},
    {id:'ps2',name:'Saucy Arrabiata',price:259},
    {id:'ps3',name:'Mac & Cheese',price:259},
    {id:'ps4',name:'Pesto Pasta',price:279},
    {id:'ps5',name:'Pinky Penne',price:279},
    {id:'ps6',name:'Aglio-E-Olio Linguine',price:299},
    {id:'ps7',name:'Primavera Pasta',price:279}
  ],
  'Pav Bhaji':[
    {id:'pb1',name:'Pav Bhaji',price:149},
    {id:'pb2',name:'Cheese Pav Bhaji',price:169},
    {id:'pb3',name:'Only Bhaji',price:99},
    {id:'pb4',name:'Cheese Bhaji',price:109},
    {id:'pb5',name:'Extra Butter Pav (2pcs)',price:59}
  ],
  'Bhature & Chole Kulche':[
    {id:'bck1',name:'Onion Kulcha with Choley',price:159},
    {id:'bck2',name:'Aloo Kulcha with Choley',price:159},
    {id:'bck3',name:'Aloo Pyaaz Kulcha with Choley',price:179},
    {id:'bck4',name:'Paneer Kulcha with Choley',price:189},
    {id:'bck5',name:'Mix Stuffed Kulcha with Choley',price:199}
  ],
  'Salad':[
    {id:'sl1',name:'Green Salad',price:79},
    {id:'sl2',name:'Aloo Chaat',price:99},
    {id:'sl3',name:'Greek Salad',price:129},
    {id:'sl4',name:'Chana Chaat',price:99},
    {id:'sl5',name:'Crispy Noodle Salad',price:129},
    {id:'sl6',name:'Kachumber Salad',price:129}
  ],
  'Raita':[
    {id:'r1',name:'Mix Veg Raita',price:99},
    {id:'r2',name:'Boondi Raita',price:99},
    {id:'r3',name:'Cucumber Raita',price:99},
    {id:'r4',name:'Mint Raita',price:99},
    {id:'r5',name:'Pineapple Raita',price:129},
    {id:'r6',name:'Fruit Raita',price:129},
    {id:'r7',name:'Plain Curd',price:89}
  ],
  'Dessert':[
    {id:'ds1',name:'Gulab Jamun (2pcs)',price:79},
    {id:'ds2',name:'Gulab Jamun with Icecream',price:169},
    {id:'ds3',name:'Hot Brownie with Chocolate Syrup',price:149},
    {id:'ds4',name:'Sizzling Chocolate Brownie',price:229},
    {id:'ds5',name:'Choco Brownie with Icecream',price:199},
    {id:'ds6',name:'Vanilla Icecream',price:109},
    {id:'ds7',name:'Strawberry Icecream',price:109},
    {id:'ds8',name:'Butterscotch Icecream',price:119},
    {id:'ds9',name:'Chocolate Icecream',price:119},
    {id:'ds10',name:'Kesar Pista Icecream',price:189},
    {id:'ds11',name:'American Nuts',price:189},
    {id:'ds12',name:'Gulab Jamun with Vanilla Custard and Rabdi',price:249}
  ],
  'Soup':[
    {id:'sp1',name:'Veg Manchow Soup',price:99},
    {id:'sp2',name:'Hot & Sour Soup',price:119},
    {id:'sp3',name:'Sweet Corn Soup',price:99},
    {id:'sp4',name:'Lemon Coriander Soup',price:129},
    {id:'sp5',name:'Cream of Mushroom Soup',price:149},
    {id:'sp6',name:'Cream of Tomato Soup',price:139}
  ],
  'Shakes':[
    {id:'sh1',name:'Strawberry Shake',price:149},
    {id:'sh2',name:'Vanilla Shake',price:149},
    {id:'sh3',name:'Cold Coffee',price:149},
    {id:'sh4',name:'Oreo Shake',price:169},
    {id:'sh5',name:'Kitkat Shake',price:169},
    {id:'sh6',name:'Ferrero Shake',price:169},
    {id:'sh7',name:'Brownie Shake',price:169},
    {id:'sh8',name:'Banana Shake',price:149}
  ],
  'Smoothies':[
    {id:'sm1',name:'Banana Smoothie',price:149},
    {id:'sm2',name:'Blueberry Smoothie',price:149},
    {id:'sm3',name:'Strawberry Smoothie',price:149},
    {id:'sm4',name:'Kiwi Smoothie',price:149},
    {id:'sm5',name:'Pineapple Smoothie',price:149}
  ],
  'Mocktails':[
    {id:'mk1',name:'Aerated Drinks',price:49},
    {id:'mk2',name:'Canned Soft Drink',price:79},
    {id:'mk3',name:'Fresh Lime Soda',price:119},
    {id:'mk4',name:'Bar Refresher',price:159},
    {id:'mk5',name:'Sea Breeze',price:159},
    {id:'mk6',name:'Floating Honeymoon',price:159},
    {id:'mk7',name:'French Kiss',price:159},
    {id:'mk8',name:'Guava Mary',price:159}
  ],
  'Mojito':[
    {id:'mj1',name:'Lemon Mojito',price:139},
    {id:'mj2',name:'Green Apple Mojito',price:139},
    {id:'mj3',name:'Cola Mojito',price:139},
    {id:'mj4',name:'Masala Coke/Sprite',price:99},
    {id:'mj5',name:'Lemon Iced Tea',price:149},
    {id:'mj6',name:'Peach Iced Tea',price:149}
  ],
  'Hot Beverages':[
    {id:'hb1',name:'Tea',price:49},
    {id:'hb2',name:'Masala Tea',price:59},
    {id:'hb3',name:'Hot Coffee',price:79},
    {id:'hb4',name:'Black Coffee',price:69},
    {id:'hb5',name:'Black Tea',price:49},
    {id:'hb6',name:'Hot Chocolate Milk',price:99}
  ],
  'Crispy Papad':[
    {id:'cp1',name:'Roasted Papad (4pcs)',price:59},
    {id:'cp2',name:'Fried Papad (4pcs)',price:69},
    {id:'cp3',name:'Masala Papad (3pcs)',price:99}
  ],
  'International':[
    {id:'int1',name:'Verdure Miste Gratinate (Baked Vegetables)',price:279},
    {id:'int2',name:'Vegetable Lasagna',price:299}
  ]
};

const FEATURED=[
  {id:'si1',name:'Classic Masala Dosa',price:159,cat:'South Indian'},
  {id:'rb8',name:'Veg Dum Biryani',price:289,cat:'Rice & Biryani'},
  {id:'sz1',name:'Cottage Cheese Sizzler',price:359,cat:'Sizzler'},
  {id:'imc1',name:'Paneer Butter Masala',price:279,cat:'Indian Main Course'},
  {id:'cos2',name:'Rajasthani Paneer Tikka (8pcs)',price:279,cat:'Clay Oven Starter'},
  {id:'ps1',name:'Creamy Alfredo',price:249,cat:'Pasta'},
  {id:'b4',name:'Grilled Paneer Burger',price:159,cat:'Burger'},
  {id:'sh4',name:'Oreo Shake',price:169,cat:'Shakes'}
];

const CAT_COLORS={
  'South Indian':'#d4622a','Burger':'#d93d3d','Sandwiches':'#c98000',
  'Indian Main Course':'#b45309','Tandoori Breads':'#92400e',
  'Dal':'#78350f','Rice & Biryani':'#b91c1c',
  'Chinese Rice & Noodles':'#c2410c','Clay Oven Starter':'#7c2d12',
  'Sizzler':'#7c3aed','Platter':'#c2185b',
  'Continental Munchies':'#1a7f3c','Continental':'#166534',
  'Pasta':'#d4521a','Pav Bhaji':'#ea580c',
  'Bhature & Chole Kulche':'#d97706','Salad':'#16a34a',
  'Raita':'#0891b2','Dessert':'#db2777',
  'Soup':'#0369a1','Shakes':'#1a56db','Smoothies':'#059669',
  'Mocktails':'#0284c7','Mojito':'#047857',
  'Hot Beverages':'#6b3a1f','Crispy Papad':'#c2410c',
  'International':'#4f46e5'
};

const IMGS={
  /* ── South Indian ── */
  'Classic Masala Dosa':'images/classic-masala-dosa.jpg',
  'Plain Dosa':'images/plain-dosa.jpg',
  'Paneer Dosa':'images/paneer-dosa.jpg',
  'Onion Dosa':'images/onion-dosa.jpg',
  'Paneer Cheese Dosa':'images/paneer-cheese-dosa.jpg',
  'Masala Cheese Dosa':'images/masala-cheese-dosa.jpg',
  'Idli (4pcs) with Sambar':'images/idli-4pcs-sambar.jpg',
  'Masala Idli with Sambar':'images/masala-idli-sambar.jpg',
  'Only Sambar':'images/only-sambar.jpg',
  'Idli (2pcs)':'images/idli-2pcs.jpg',
  'Double Roast Uthappa':'images/double-roast-uthappa.jpg',
  /* ── Burger ── */
  'Aloo Tikki Burger':'images/aloo-tikki-burger.jpg',
  'Aloo Tikki Cheese Burger':'images/aloo-tikki-cheese-burger.jpg',
  'Veg Double Cheese Burger':'images/veg-double-cheese-burger.jpg',
  'Grilled Paneer Burger':'images/grilled-paneer-burger.jpg',
  'Double Open Burger':'images/double-open-burger.jpg',
  /* ── Sandwiches ── */
  'Corn Cheese Grilled Sandwich':'images/corn-cheese-grilled-sandwich.jpg',
  'Paneer Tikka Grilled Sandwich':'images/paneer-tikka-grilled-sandwich.jpg',
  'English Grilled Veg Sandwich':'images/english-grilled-veg-sandwich.jpg',
  'Veg Grilled Sandwich':'images/veg-grilled-sandwich.jpg',
  'Bombay Masala Grilled Sandwich':'images/bombay-masala-grilled-sandwich.jpg',
  'Grilled Mushroom Sandwich':'images/grilled-mushroom-sandwich.jpg',
  /* ── Indian Main Course ── */
  'Paneer Butter Masala':'images/paneer-butter-masala.jpg',
  'Paneer Rogan Josh':'images/paneer-rogan-josh.jpg',
  'Paneer Kadai':'images/paneer-kadai.jpg',
  'Paneer Lababdar':'images/paneer-lababdar.jpg',
  'Paneer Khurchan':'images/paneer-khurchan.jpg',
  'Paneer Makhani':'images/paneer-makhani.jpg',
  'Paneer Handi':'images/paneer-handi.jpg',
  'Paneer Methi Malai':'images/paneer-methi-malai.jpg',
  'Heeng Jeera Ke Chatpate Aloo':'images/heeng-jeera-aloo.jpg',
  'Mix Vegetable':'images/mix-vegetable.jpg',
  'Subz Kolhapuri':'images/subz-kolhapuri.jpg',
  'Palak Paneer':'images/palak-paneer.jpg',
  'Shahi Paneer':'images/shahi-paneer.jpg',
  'Paneer Do Pyaza':'images/paneer-do-pyaza.jpg',
  'Mushroom Do Pyaza':'images/mushroom-do-pyaza.jpg',
  'Mushroom Masala':'images/mushroom-masala.jpg',
  /* ── Tandoori Breads ── */
  'Plain Roti':'images/plain-roti.jpg',
  'Butter Roti':'images/butter-roti.jpg',
  'Missi Roti':'images/missi-roti.jpg',
  'Lachha Paratha':'images/lachha-paratha.jpg',
  'Hari Mirch Paratha':'images/hari-mirch-paratha.jpg',
  'Plain Naan':'images/plain-naan.jpg',
  'Butter Naan':'images/butter-naan.jpg',
  'Garlic Naan':'images/garlic-naan.jpg',
  'Onion Kulcha':'images/onion-kulcha.jpg',
  'Aloo Kulcha':'images/aloo-kulcha.jpg',
  'Paneer Kulcha':'images/paneer-kulcha.jpg',
  'Mix Stuffed Kulcha':'images/mix-stuffed-kulcha.jpg',
  'Amritsar Kulcha':'images/amritsar-kulcha.jpg',
  'Masala Cheese Naan':'images/masala-cheese-naan.jpg',
  'Add On (Green Chilli / Garlic / Pudina / Onion)':'images/add-on.jpg',
  /* ── Dal ── */
  'Dal Fry':'images/dal-fry.jpg',
  'Dal Tadka':'images/dal-tadka.jpg',
  'Dal Dhaba':'images/dal-dhaba.jpg',
  'Dal Makhani':'images/dal-makhani.jpg',
  /* ── Rice & Biryani ── */
  'Steamed Rice':'images/steamed-rice.jpg',
  'Jeera Rice':'images/jeera-rice.jpg',
  'Onion Jeera Rice':'images/onion-jeera-rice.jpg',
  'Peas Pulao':'images/peas-pulao.jpg',
  'Corn Masala Pulao':'images/corn-masala-pulao.jpg',
  'Paneer Pulao':'images/paneer-pulao.jpg',
  'Navratan Pulao':'images/navratan-pulao.jpg',
  'Veg Dum Biryani':'images/veg-dum-biryani.jpg',
  'Hyderabadi Biryani':'images/hyderabadi-biryani.jpg',
  'Paneer Tikka Biryani':'images/paneer-tikka-biryani.jpg',
  /* ── Chinese Rice & Noodles ── */
  'Hakka Noodles':'images/hakka-noodles.jpg',
  'Burn Chilli Garlic Noodles':'images/burn-chilli-garlic-noodles.jpg',
  'Schezwan Noodles':'images/schezwan-noodles.jpg',
  'Singapore Noodles':'images/singapore-noodles.jpg',
  'Veg Fried Rice':'images/veg-fried-rice.jpg',
  'Singapore Fried Rice':'images/singapore-fried-rice.jpg',
  'Schezwan Fried Rice':'images/schezwan-fried-rice.jpg',
  'Corn & Mushroom Fried Rice':'images/corn-mushroom-fried-rice.jpg',
  'Paneer Fried Rice':'images/paneer-fried-rice.jpg',
  /* ── Clay Oven Starter ── */
  'Veg Seekh Kebab (8pcs)':'images/veg-seekh-kebab.jpg',
  'Rajasthani Paneer Tikka (8pcs)':'images/rajasthani-paneer-tikka.jpg',
  'Malai Paneer Tikka (8pcs)':'images/malai-paneer-tikka.jpg',
  'Achari Paneer Tikka (8pcs)':'images/achari-paneer-tikka.jpg',
  'Mushroom Tikka (14pcs)':'images/mushroom-tikka.jpg',
  'Tandoori Soya Chaap (10pcs)':'images/tandoori-soya-chaap.jpg',
  'Achari Soya Chaap (10pcs)':'images/achari-soya-chaap.jpg',
  'Malai Chaap (10pcs)':'images/malai-chaap.jpg',
  'Classic Dahi Ke Kebab (8pcs)':'images/dahi-ke-kebab.jpg',
  'Hara Bhara Kebab (8pcs)':'images/hara-bhara-kebab.jpg',
  'Stuffed Tandoori Mushroom (10pcs)':'images/stuffed-tandoori-mushroom.jpg',
  /* ── Sizzler ── */
  'Cottage Cheese Sizzler':'images/cottage-cheese-sizzler.jpg',
  'Chinese Sizzler':'images/chinese-sizzler.jpg',
  'Mexican Sizzler':'images/mexican-sizzler.jpg',
  'Kebab Sizzler':'images/kebab-sizzler.jpg',
  /* ── Platter ── */
  'Tandoori Veg Platter (15pcs)':'images/tandoori-veg-platter.jpg',
  'Chinese Platter':'images/chinese-platter.jpg',
  /* ── Continental Munchies ── */
  'French Fries':'images/french-fries.jpg',
  'Peri Peri French Fries':'images/peri-peri-french-fries.jpg',
  'Plain Garlic Bread (4pcs)':'images/plain-garlic-bread.jpg',
  'Cheese Garlic Bread (4pcs)':'images/cheese-garlic-bread.jpg',
  'Mexican Loaded Nachos':'images/mexican-loaded-nachos.jpg',
  'Corn Cheese Bruschetta':'images/corn-cheese-bruschetta.jpg',
  'Mushroom Cheese Bruschetta':'images/mushroom-cheese-bruschetta.jpg',
  'Corn & Bell Peppers Bruschetta':'images/corn-bell-peppers-bruschetta.jpg',
  'Mushroom & Bell Peppers Bruschetta':'images/mushroom-bell-peppers-bruschetta.jpg',
  /* ── Continental ── */
  'Corn Cheese Ball':'images/corn-cheese-ball.jpg',
  'Mexican Quesadilla':'images/mexican-quesadilla.jpg',
  'Baked Mushroom Cap':'images/baked-mushroom-cap.jpg',
  'Grilled Cottage Cheese Quesadilla':'images/grilled-cottage-cheese-quesadilla.jpg',
  /* ── Pasta ── */
  'Creamy Alfredo':'images/creamy-alfredo.jpg',
  'Saucy Arrabiata':'images/saucy-arrabiata.jpg',
  'Mac & Cheese':'images/mac-and-cheese.jpg',
  'Pesto Pasta':'images/pesto-pasta.jpg',
  'Pinky Penne':'images/pinky-penne.jpg',
  'Aglio-E-Olio Linguine':'images/aglio-e-olio-linguine.jpg',
  'Primavera Pasta':'images/primavera-pasta.jpg',
  /* ── Pav Bhaji ── */
  'Pav Bhaji':'images/pav-bhaji.jpg',
  'Cheese Pav Bhaji':'images/cheese-pav-bhaji.jpg',
  'Only Bhaji':'images/only-bhaji.jpg',
  'Cheese Bhaji':'images/cheese-bhaji.jpg',
  'Extra Butter Pav (2pcs)':'images/extra-butter-pav.jpg',
  /* ── Bhature & Chole Kulche ── */
  'Onion Kulcha with Choley':'images/onion-kulcha-choley.jpg',
  'Aloo Kulcha with Choley':'images/aloo-kulcha-choley.jpg',
  'Aloo Pyaaz Kulcha with Choley':'images/aloo-pyaaz-kulcha-choley.jpg',
  'Paneer Kulcha with Choley':'images/paneer-kulcha-choley.jpg',
  'Mix Stuffed Kulcha with Choley':'images/mix-stuffed-kulcha-choley.jpg',
  /* ── Salad ── */
  'Green Salad':'images/green-salad.jpg',
  'Aloo Chaat':'images/aloo-chaat.jpg',
  'Greek Salad':'images/greek-salad.jpg',
  'Chana Chaat':'images/chana-chaat.jpg',
  'Crispy Noodle Salad':'images/crispy-noodle-salad.jpg',
  'Kachumber Salad':'images/kachumber-salad.jpg',
  /* ── Raita ── */
  'Mix Veg Raita':'images/mix-veg-raita.jpg',
  'Boondi Raita':'images/boondi-raita.jpg',
  'Cucumber Raita':'images/cucumber-raita.jpg',
  'Mint Raita':'images/mint-raita.jpg',
  'Pineapple Raita':'images/pineapple-raita.jpg',
  'Fruit Raita':'images/fruit-raita.jpg',
  'Plain Curd':'images/plain-curd.jpg',
  /* ── Dessert ── */
  'Gulab Jamun (2pcs)':'images/gulab-jamun.jpg',
  'Gulab Jamun with Icecream':'images/gulab-jamun-icecream.jpg',
  'Hot Brownie with Chocolate Syrup':'images/hot-brownie-chocolate-syrup.jpg',
  'Sizzling Chocolate Brownie':'images/sizzling-chocolate-brownie.jpg',
  'Choco Brownie with Icecream':'images/choco-brownie-icecream.jpg',
  'Vanilla Icecream':'images/vanilla-icecream.jpg',
  'Strawberry Icecream':'images/strawberry-icecream.jpg',
  'Butterscotch Icecream':'images/butterscotch-icecream.jpg',
  'Chocolate Icecream':'images/chocolate-icecream.jpg',
  'Kesar Pista Icecream':'images/kesar-pista-icecream.jpg',
  'American Nuts':'images/american-nuts.jpg',
  'Gulab Jamun with Vanilla Custard and Rabdi':'images/gulab-jamun-custard-rabdi.jpg',
  /* ── Soup ── */
  'Veg Manchow Soup':'images/veg-manchow-soup.jpg',
  'Hot & Sour Soup':'images/hot-and-sour-soup.jpg',
  'Sweet Corn Soup':'images/sweet-corn-soup.jpg',
  'Lemon Coriander Soup':'images/lemon-coriander-soup.jpg',
  'Cream of Mushroom Soup':'images/cream-of-mushroom-soup.jpg',
  'Cream of Tomato Soup':'images/cream-of-tomato-soup.jpg',
  /* ── Shakes ── */
  'Strawberry Shake':'images/strawberry-shake.jpg',
  'Vanilla Shake':'images/vanilla-shake.jpg',
  'Cold Coffee':'images/cold-coffee.jpg',
  'Oreo Shake':'images/oreo-shake.jpg',
  'Kitkat Shake':'images/kitkat-shake.jpg',
  'Ferrero Shake':'images/ferrero-shake.jpg',
  'Brownie Shake':'images/brownie-shake.jpg',
  'Banana Shake':'images/banana-shake.jpg',
  /* ── Smoothies ── */
  'Banana Smoothie':'images/banana-smoothie.jpg',
  'Blueberry Smoothie':'images/blueberry-smoothie.jpg',
  'Strawberry Smoothie':'images/strawberry-smoothie.jpg',
  'Kiwi Smoothie':'images/kiwi-smoothie.jpg',
  'Pineapple Smoothie':'images/pineapple-smoothie.jpg',
  /* ── Mocktails ── */
  'Aerated Drinks':'images/aerated-drinks.jpg',
  'Canned Soft Drink':'images/canned-soft-drink.jpg',
  'Fresh Lime Soda':'images/fresh-lime-soda.jpg',
  'Bar Refresher':'images/bar-refresher.jpg',
  'Sea Breeze':'images/sea-breeze.jpg',
  'Floating Honeymoon':'images/floating-honeymoon.jpg',
  'French Kiss':'images/french-kiss.jpg',
  'Guava Mary':'images/guava-mary.jpg',
  /* ── Mojito ── */
  'Lemon Mojito':'images/lemon-mojito.jpg',
  'Green Apple Mojito':'images/green-apple-mojito.jpg',
  'Cola Mojito':'images/cola-mojito.jpg',
  'Masala Coke/Sprite':'images/masala-coke-sprite.jpg',
  'Lemon Iced Tea':'images/lemon-iced-tea.jpg',
  'Peach Iced Tea':'images/peach-iced-tea.jpg',
  /* ── Hot Beverages ── */
  'Tea':'images/tea.jpg',
  'Masala Tea':'images/masala-tea.jpg',
  'Hot Coffee':'images/hot-coffee.jpg',
  'Black Coffee':'images/black-coffee.jpg',
  'Black Tea':'images/black-tea.jpg',
  'Hot Chocolate Milk':'images/hot-chocolate-milk.jpg',
  /* ── Crispy Papad ── */
  'Roasted Papad (4pcs)':'images/roasted-papad.jpg',
  'Fried Papad (4pcs)':'images/fried-papad.jpg',
  'Masala Papad (3pcs)':'images/masala-papad.jpg',
  /* ── International ── */
  'Verdure Miste Gratinate (Baked Vegetables)':'images/verdure-miste-gratinate.jpg',
  'Vegetable Lasagna':'images/vegetable-lasagna.jpg'
};
function getImg(n){
  return IMGS[n]||'images/default.jpg';
}

/* ═══════════════════════════════════════
   STATE
═══════════════════════════════════════ */
let cart=JSON.parse(localStorage.getItem('annamay5')||'[]');
let activeCat='South Indian', selItem=null, selQty=1, searchMode=false;
let slideIdx=0; const SLIDES=6; let slideTimer;
const FB = 'https://restaurant-a6aee-default-rtdb.asia-southeast1.firebasedatabase.app';
let ordersOpen = true;

/* ═══════════════════════════════════════
   ██████████████████████████████████
   RADIAL WHEEL ENGINE
   
   FIXED 7 SLOTS — angles in standard math coords:
   Slot 0 (ACTIVE) = top center    = 270° = -90°
   Slot 1 = upper-right            = 315° = -45°
   Slot 2 = right                  = 360° = 0°
   Slot 3 = lower-right (partial)  = 405° = 45°
   Slot 4 = upper-left             = 225°
   Slot 5 = left                   = 180°
   Slot 6 = lower-left (partial)   = 135°
   
   The rotor div's center sits at the BOTTOM-CENTER of the container.
   Container height = R (radius) + node-radius + padding, overflow hidden.
   This clips the bottom half of the rotor, showing only the top arc.
   
   dataOffset: which dish index maps to slot 0 (active).
   When user rotates right: dataOffset increases by 1.
   When user rotates left: dataOffset decreases by 1.
   ██████████████████████████████████
═══════════════════════════════════════ */

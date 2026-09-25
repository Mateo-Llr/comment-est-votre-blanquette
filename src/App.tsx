import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType, NotFoundException } from '@zxing/library'
import { ArrowRight, Camera, Check, ChevronDown, CircleHelp, Grid2X2, Info, Leaf, List, Menu, Search, ScanLine, Sparkles, X } from 'lucide-react'
import './App.css'

type Produce = { name: string; type: string; category: string; note: string; color: string; image: string; components: string[] }
type ComponentInfo = { name: string; kind: string; summary: string; benefits: string[]; cautions: string[] }
type PantryItem = { barcode: string; name: string; brand?: string; image?: string; nutriscore?: string; addedAt: number }
type Recipe = { name: string; type: string; time: string; image: string; ingredients: string[]; description: string }

const images = {
  tomato: 'https://openmoji.org/data/color/svg/1F345.svg', zucchini: 'https://openmoji.org/data/color/svg/1F952.svg', melon: 'https://openmoji.org/data/color/svg/1F348.svg', peach: 'https://openmoji.org/data/color/svg/1F351.svg', apple: 'https://openmoji.org/data/color/svg/1F34E.svg', carrot: 'https://openmoji.org/data/color/svg/1F955.svg', strawberry: 'https://openmoji.org/data/color/svg/1F353.svg', broccoli: 'https://openmoji.org/data/color/svg/1F966.svg', aubergine: 'https://openmoji.org/data/color/svg/1F346.svg', pear: 'https://openmoji.org/data/color/svg/1F350.svg', spinach: 'https://openmoji.org/data/color/svg/1F96C.svg', grape: 'https://openmoji.org/data/color/svg/1F347.svg', cucumber: 'https://openmoji.org/data/color/svg/1F952.svg', pepper: 'https://openmoji.org/data/color/svg/1FAD1.svg', greenBean: 'https://openmoji.org/data/color/svg/1FAD8.svg', sweetPotato: 'https://openmoji.org/data/color/svg/1F360.svg', banana: 'https://openmoji.org/data/color/svg/1F34C.svg', lemon: 'https://openmoji.org/data/color/svg/1F34B.svg', raspberry: 'https://openmoji.org/data/color/svg/1FAD0.svg', plum: 'https://openmoji.org/data/color/svg/1F353.svg', kiwi: 'https://openmoji.org/data/color/svg/1F95D.svg', pineapple: 'https://openmoji.org/data/color/svg/1F34D.svg', watermelon: 'https://openmoji.org/data/color/svg/1F349.svg', cherry: 'https://openmoji.org/data/color/svg/1F352.svg', blueberry: 'https://openmoji.org/data/color/svg/1FAD0.svg', avocado: 'https://openmoji.org/data/color/svg/1F951.svg', coconut: 'https://openmoji.org/data/color/svg/1F965.svg', garlic: 'https://cdn-icons-png.flaticon.com/512/4465/4465216.png', onion: 'https://cdn-icons-png.flaticon.com/512/517/517610.png', potato: 'https://openmoji.org/data/color/svg/1F954.svg', corn: 'https://openmoji.org/data/color/svg/1F33D.svg', mushroom: 'https://openmoji.org/data/color/svg/1F344.svg', lettuce: 'https://cdn-icons-png.flaticon.com/512/3823/3823393.png', orange: 'https://openmoji.org/data/color/svg/1F34A.svg', cabbage: 'https://openmoji.org/data/color/svg/1F96C.svg', leek: 'https://cdn-icons-png.flaticon.com/512/7100/7100440.png', beetroot: 'https://cdn-icons-png.flaticon.com/512/5346/5346557.png', turnip: 'https://cdn-icons-png.flaticon.com/512/7476/7476437.png', cauliflower: 'https://cdn-icons-png.flaticon.com/512/3768/3768378.png', salad: 'https://cdn-icons-png.flaticon.com/512/3823/3823393.png', asparagus: 'https://openmoji.org/data/color/svg/1F96C.svg', pumpkin: 'https://openmoji.org/data/color/svg/1F383.svg', radish: 'https://openmoji.org/data/color/svg/1F955.svg', fennel: 'https://openmoji.org/data/color/svg/1F96C.svg', artichoke: 'https://openmoji.org/data/color/svg/1F966.svg', celery: 'https://cdn-icons-png.flaticon.com/512/7100/7100440.png', peas: 'https://openmoji.org/data/color/svg/1FAD8.svg', brusselsSprouts: 'https://openmoji.org/data/color/svg/1F966.svg',
}

const produce: Produce[] = [
  { name: 'La tomate', type: 'Légume-fruit', category: 'Légumes', note: 'Pleine saison', color: '#ed6a46', image: images.tomato, components: ['vitamine-c', 'lycopene', 'fibres'] },
  { name: 'La courgette', type: 'Légume', category: 'Légumes', note: 'Pleine saison', color: '#8fba50', image: images.zucchini, components: ['fibres', 'vitamine-c', 'potassium'] },
  { name: 'Le melon', type: 'Fruit', category: 'Fruits', note: 'À son meilleur', color: '#f0a449', image: images.melon, components: ['vitamine-c', 'beta-carotene', 'eau'] },
  { name: 'La pêche', type: 'Fruit', category: 'Fruits', note: 'Encore un peu', color: '#efa083', image: images.peach, components: ['fibres', 'vitamine-c', 'polyphenols'] },
  { name: 'La pomme', type: 'Fruit', category: 'Fruits', note: 'Toute l’année', color: '#d86b58', image: images.apple, components: ['fibres', 'polyphenols', 'fructose'] },
  { name: 'La carotte', type: 'Racine', category: 'Racines', note: 'Pleine saison', color: '#e49a3c', image: images.carrot, components: ['beta-carotene', 'fibres', 'potassium'] },
  { name: 'La fraise', type: 'Fruit rouge', category: 'Fruits rouges', note: 'Fin de saison', color: '#dc6a72', image: images.strawberry, components: ['vitamine-c', 'polyphenols', 'fructose'] },
  { name: 'Le brocoli', type: 'Chou', category: 'Légumes', note: 'Pleine saison', color: '#65945d', image: images.broccoli, components: ['fibres', 'vitamine-c', 'folates'] },
  { name: 'L’aubergine', type: 'Légume-fruit', category: 'Légumes', note: 'Fin de saison', color: '#75618d', image: images.aubergine, components: ['fibres', 'polyphenols', 'potassium'] },
  { name: 'La poire', type: 'Fruit', category: 'Fruits', note: 'À son meilleur', color: '#a9ad62', image: images.pear, components: ['fibres', 'fructose', 'polyphenols'] },
  { name: 'Les épinards', type: 'Feuille', category: 'Feuilles', note: 'Pleine saison', color: '#618b67', image: images.spinach, components: ['fer', 'folates', 'fibres'] },
  { name: 'Le raisin', type: 'Fruit', category: 'Fruits', note: 'Fin de saison', color: '#726084', image: images.grape, components: ['polyphenols', 'fructose', 'eau'] },
  { name: 'Le concombre', type: 'Légume', category: 'Légumes', note: 'Pleine saison', color: '#6c9b74', image: images.cucumber, components: ['eau', 'fibres', 'vitamine-c'] },
  { name: 'Le poivron', type: 'Légume-fruit', category: 'Légumes', note: 'Pleine saison', color: '#d96345', image: images.pepper, components: ['vitamine-c', 'fibres', 'polyphenols'] },
  { name: 'Le haricot vert', type: 'Légume', category: 'Légumes', note: 'Fin de saison', color: '#638b51', image: images.greenBean, components: ['fibres', 'folates', 'potassium'] },
  { name: 'La patate douce', type: 'Tubercule', category: 'Racines', note: 'À son meilleur', color: '#bd7654', image: images.sweetPotato, components: ['beta-carotene', 'fibres', 'potassium'] },
  { name: 'La banane', type: 'Fruit', category: 'Fruits', note: 'Toute l’année', color: '#d5aa43', image: images.banana, components: ['potassium', 'fructose', 'fibres'] },
  { name: 'Le citron', type: 'Agrume', category: 'Fruits', note: 'Toute l’année', color: '#d6b949', image: images.lemon, components: ['vitamine-c', 'eau', 'fibres'] },
  { name: 'La framboise', type: 'Fruit rouge', category: 'Fruits rouges', note: 'Fin de saison', color: '#bf6275', image: images.raspberry, components: ['fibres', 'vitamine-c', 'polyphenols'] },
  { name: 'La prune', type: 'Fruit', category: 'Fruits', note: 'Fin de saison', color: '#796083', image: images.plum, components: ['fibres', 'polyphenols', 'fructose'] },
  { name: 'Le kiwi', type: 'Fruit', category: 'Fruits', note: 'Toute l’année', color: '#879b4b', image: images.kiwi, components: ['vitamine-c', 'fibres', 'eau'] },
  { name: 'L’ananas', type: 'Fruit exotique', category: 'Exotiques', note: 'Toute l’année', color: '#c6a632', image: images.pineapple, components: ['vitamine-c', 'fibres', 'fructose'] },
  { name: 'La pastèque', type: 'Fruit', category: 'Fruits', note: 'Pleine saison', color: '#d96869', image: images.watermelon, components: ['eau', 'fructose', 'polyphenols'] },
  { name: 'La cerise', type: 'Fruit rouge', category: 'Fruits rouges', note: 'Courte saison', color: '#b54e5a', image: images.cherry, components: ['polyphenols', 'fructose', 'eau'] },
  { name: 'La myrtille', type: 'Fruit rouge', category: 'Fruits rouges', note: 'Fin de saison', color: '#5c6e9b', image: images.blueberry, components: ['polyphenols', 'fibres', 'vitamine-c'] },
  { name: 'L’avocat', type: 'Fruit', category: 'Exotiques', note: 'Toute l’année', color: '#719251', image: images.avocado, components: ['fibres', 'folates', 'potassium'] },
  { name: 'La noix de coco', type: 'Fruit exotique', category: 'Exotiques', note: 'Toute l’année', color: '#a78762', image: images.coconut, components: ['fibres', 'potassium', 'eau'] },
  { name: 'L’ail', type: 'Bulbe', category: 'Légumes', note: 'Toute l’année', color: '#c9b58e', image: images.garlic, components: ['fibres', 'polyphenols', 'potassium'] },
  { name: 'L’oignon', type: 'Bulbe', category: 'Légumes', note: 'Toute l’année', color: '#b98b70', image: images.onion, components: ['fibres', 'polyphenols', 'folates'] },
  { name: 'La pomme de terre', type: 'Tubercule', category: 'Racines', note: 'Toute l’année', color: '#a98a62', image: images.potato, components: ['fibres', 'potassium', 'folates'] },
  { name: 'Le maïs', type: 'Céréale fraîche', category: 'Légumes', note: 'Pleine saison', color: '#d5ad37', image: images.corn, components: ['fibres', 'folates', 'potassium'] },
  { name: 'Le champignon', type: 'Champignon', category: 'Champignons', note: 'Toute l’année', color: '#9d806c', image: images.mushroom, components: ['fibres', 'potassium', 'folates'] },
  { name: 'La laitue', type: 'Feuille', category: 'Feuilles', note: 'Pleine saison', color: '#7ca36a', image: images.lettuce, components: ['fibres', 'folates', 'eau'] },
  { name: 'L’orange', type: 'Agrume', category: 'Hors saison', note: 'Hors saison', color: '#e28b3d', image: images.orange, components: ['vitamine-c', 'fibres', 'eau'] },
  { name: 'Le chou-fleur', type: 'Chou', category: 'Hors saison', note: 'Hors saison', color: '#9b9d84', image: images.cauliflower, components: ['fibres', 'vitamine-c', 'folates'] },
  { name: 'Le poireau', type: 'Légume', category: 'Hors saison', note: 'Hors saison', color: '#739366', image: images.leek, components: ['fibres', 'folates', 'potassium'] },
  { name: 'La betterave', type: 'Racine', category: 'Hors saison', note: 'Hors saison', color: '#9f536b', image: images.beetroot, components: ['fibres', 'folates', 'potassium'] },
  { name: 'Le navet', type: 'Racine', category: 'Hors saison', note: 'Hors saison', color: '#9d8ba8', image: images.turnip, components: ['fibres', 'vitamine-c', 'potassium'] },
  { name: 'Le chou vert', type: 'Feuille', category: 'Hors saison', note: 'Hors saison', color: '#638a66', image: images.cabbage, components: ['fibres', 'vitamine-c', 'folates'] },
  { name: 'La salade', type: 'Feuille', category: 'Légumes', note: 'Pleine saison', color: '#77a85e', image: images.salad, components: ['fibres', 'folates', 'eau'] },
  { name: 'L’asperge', type: 'Tige', category: 'Légumes', note: 'Courte saison', color: '#779b5b', image: images.asparagus, components: ['fibres', 'folates', 'potassium'] },
  { name: 'La courge', type: 'Légume-fruit', category: 'Légumes', note: 'À son meilleur', color: '#d89042', image: images.pumpkin, components: ['beta-carotene', 'fibres', 'potassium'] },
  { name: 'Le radis', type: 'Racine', category: 'Racines', note: 'Pleine saison', color: '#d16f72', image: images.radish, components: ['fibres', 'vitamine-c', 'eau'] },
  { name: 'Le fenouil', type: 'Bulbe', category: 'Légumes', note: 'Pleine saison', color: '#88a476', image: images.fennel, components: ['fibres', 'folates', 'potassium'] },
  { name: 'L’artichaut', type: 'Légume-fleur', category: 'Légumes', note: 'Courte saison', color: '#6e9964', image: images.artichoke, components: ['fibres', 'folates', 'potassium'] },
  { name: 'Le céleri', type: 'Tige', category: 'Légumes', note: 'Toute l’année', color: '#789d69', image: images.celery, components: ['fibres', 'eau', 'potassium'] },
  { name: 'Les petits pois', type: 'Légumineuse fraîche', category: 'Légumes', note: 'Courte saison', color: '#77a64d', image: images.peas, components: ['fibres', 'folates', 'fer'] },
  { name: 'Le chou de Bruxelles', type: 'Chou', category: 'Légumes', note: 'Pleine saison', color: '#6d955d', image: images.brusselsSprouts, components: ['fibres', 'vitamine-c', 'folates'] },
]

const componentInfo: Record<string, ComponentInfo> = {
  fibres: { name: 'Fibres', kind: 'Équilibre digestif', summary: 'Les fibres sont des glucides que notre organisme digère peu. Elles nourrissent le microbiote et ralentissent l’absorption des sucres.', benefits: ['Favorisent un transit régulier', 'Participent à la satiété', 'Nourrissent les bonnes bactéries intestinales'], cautions: ['Augmenter progressivement si votre alimentation en contient peu', 'Boire suffisamment d’eau pour un meilleur confort'] },
  'vitamine-c': { name: 'Vitamine C', kind: 'Défenses naturelles', summary: 'Une vitamine antioxydante hydrosoluble, présente notamment dans les fruits et légumes frais.', benefits: ['Contribue au fonctionnement normal du système immunitaire', 'Aide à réduire la fatigue', 'Améliore l’absorption du fer végétal'], cautions: ['La cuisson prolongée peut en réduire la quantité', 'Les besoins sont couverts par une alimentation variée'] },
  'beta-carotene': { name: 'Bêta-carotène', kind: 'Précurseur de vitamine A', summary: 'Ce pigment orange et vert est transformé par le corps en vitamine A selon ses besoins.', benefits: ['Contribue au maintien d’une vision normale', 'Participe à la santé de la peau', 'Protège les cellules du stress oxydatif'], cautions: ['À distinguer des compléments fortement dosés', 'La cuisson douce avec un peu de matière grasse aide son absorption'] },
  lycopene: { name: 'Lycopène', kind: 'Pigment antioxydant', summary: 'Un caroténoïde rouge que l’on retrouve surtout dans la tomate mûre.', benefits: ['Aide à protéger les cellules contre le stress oxydatif', 'Sa disponibilité augmente avec une cuisson douce'], cautions: ['Ce n’est pas un médicament ni un traitement', 'Varier les sources d’antioxydants reste préférable'] },
  potassium: { name: 'Potassium', kind: 'Minéral essentiel', summary: 'Un minéral qui intervient dans l’équilibre hydrique et le fonctionnement musculaire.', benefits: ['Contribue au fonctionnement normal du système nerveux', 'Participe au maintien d’une pression artérielle normale'], cautions: ['En cas de maladie rénale, demander conseil à un professionnel de santé', 'L’eau de cuisson peut en contenir une partie'] },
  polyphenols: { name: 'Polyphénols', kind: 'Composés végétaux', summary: 'Une grande famille de composés naturellement présents dans les végétaux, souvent responsables de leur couleur.', benefits: ['Participent à la protection des cellules', 'Diversifient les apports antioxydants'], cautions: ['Les effets dépendent de la variété et de la quantité consommée', 'Aucun aliment ne compense à lui seul un déséquilibre'] },
  fructose: { name: 'Fructose', kind: 'Sucre naturellement présent', summary: 'Un sucre présent dans les fruits, accompagné d’eau, de fibres et de micronutriments.', benefits: ['Fournit une source d’énergie', 'Les fruits entiers apportent aussi des fibres'], cautions: ['Privilégier le fruit entier aux jus', 'Une consommation excessive peut gêner les personnes sensibles'] },
  eau: { name: 'Eau', kind: 'Hydratation', summary: 'Les fruits et légumes riches en eau contribuent à l’hydratation quotidienne.', benefits: ['Aide à couvrir les besoins hydriques', 'Participe au confort digestif'], cautions: ['Ne remplace pas la consommation d’eau', 'La teneur varie selon la maturité et la conservation'] },
  folates: { name: 'Folates (B9)', kind: 'Vitamine du groupe B', summary: 'Une vitamine impliquée dans le renouvellement cellulaire et la formation normale du sang.', benefits: ['Contribue à réduire la fatigue', 'Participe au fonctionnement normal du système immunitaire'], cautions: ['Les besoins peuvent être spécifiques pendant la grossesse', 'Demander conseil pour toute supplémentation'] },
  fer: { name: 'Fer', kind: 'Minéral essentiel', summary: 'Le fer végétal est moins facilement absorbé, mais la vitamine C peut améliorer son assimilation.', benefits: ['Contribue au transport normal de l’oxygène', 'Participe à la réduction de la fatigue'], cautions: ['Le fer végétal est moins bien absorbé que le fer animal', 'Éviter l’automédication par complément'] },
}

const navItems = ['Saison', 'Frigo', 'Recettes', 'Scanner']
const categories = ['Tous', 'Fruits', 'Légumes', 'Racines', 'Feuilles', 'Fruits rouges', 'Exotiques', 'Champignons', 'Hors saison']
const recipes: Recipe[] = [
  { name: 'Ratatouille minute', type: 'Plat végétal', time: '35 min', image: images.aubergine, ingredients: ['tomate', 'courgette', 'poivron', 'oignon', 'ail'], description: 'Un grand classique coloré qui accueille les légumes qui restent.' },
  { name: 'Soupe orange', type: 'Velouté', time: '30 min', image: images.carrot, ingredients: ['carotte', 'patate douce', 'oignon'], description: 'Douce, réconfortante et parfaite pour utiliser les racines.' },
  { name: 'Salade croquante', type: 'Entrée fraîche', time: '15 min', image: images.salad, ingredients: ['salade', 'concombre', 'pomme', 'citron'], description: 'Une assiette fraîche à composer selon les trouvailles du frigo.' },
  { name: 'Poêlée verte', type: 'Plat végétal', time: '20 min', image: images.greenBean, ingredients: ['haricot vert', 'brocoli', 'épinard', 'ail'], description: 'Un plat rapide avec les légumes verts à portée de main.' },
]

function App() {
  const [activeNav, setActiveNav] = useState('Saison')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Tous')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selectedComponent, setSelectedComponent] = useState<ComponentInfo | null>(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [scanStatus, setScanStatus] = useState('Prêt à scanner')
  const [barcode, setBarcode] = useState('')
  const [product, setProduct] = useState<{ name: string; brand?: string; nutriscore?: string; image?: string } | null>(null)
  const [pantry, setPantry] = useState<PantryItem[]>(() => {
    const stored = localStorage.getItem('blanquette-pantry')
    return stored ? JSON.parse(stored) : []
  })
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lookupProductRef = useRef<(code: string) => void>(() => undefined)
  const lastSearchedCodeRef = useRef('')
  const filteredProduce = produce.filter((item) => (category === 'Tous' || item.category === category) && item.name.toLowerCase().includes(search.toLowerCase()))
  const suggestedRecipes = recipes.map((recipe) => {
    const owned = recipe.ingredients.filter((ingredient) => pantry.some((item) => item.name.toLowerCase().includes(ingredient)))
    return { ...recipe, owned, missing: recipe.ingredients.length - owned.length }
  }).sort((first, second) => second.owned.length - second.missing - (first.owned.length - first.missing))

  const updatePantry = (items: PantryItem[]) => {
    setPantry(items)
    localStorage.setItem('blanquette-pantry', JSON.stringify(items))
  }

  const removeFromPantry = (barcodeToRemove: string) => updatePantry(pantry.filter((item) => item.barcode !== barcodeToRemove))

  useEffect(() => {
    if (!isScannerOpen) return

    let cancelled = false
    let controls: { stop: () => void } | undefined

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setScanStatus('Caméra indisponible, saisissez un code')
        return
      }

      try {
        const video = videoRef.current
        if (!video) return

        const hints = new Map<DecodeHintType, unknown>([
          [DecodeHintType.POSSIBLE_FORMATS, [
            BarcodeFormat.EAN_13,
            BarcodeFormat.EAN_8,
            BarcodeFormat.UPC_A,
            BarcodeFormat.UPC_E,
            BarcodeFormat.CODE_128,
            BarcodeFormat.ITF,
          ]],
          [DecodeHintType.TRY_HARDER, true],
        ])
        const codeReader = new BrowserMultiFormatReader(hints)
        setScanStatus('Cadrez le code-barres')

        // On laisse ZXing gérer seul l'accès caméra (via decodeFromConstraints) :
        // faire un getUserMedia séparé en plus créait un second flux caméra,
        // ce que la plupart des navigateurs mobiles refusent ou gèrent mal,
        // contrairement au desktop où plusieurs flux passent souvent sans erreur.
        const cameraControls = await codeReader.decodeFromConstraints(
          {
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          },
          video,
          (result, error) => {
            if (cancelled) return

            if (result) {
              const value = result.getText()
              const cleanCode = value.replace(/\D/g, '').trim()
              if (!cleanCode) return
              setBarcode(cleanCode)
              setScanStatus('Code détecté')
              lookupProductRef.current(cleanCode)
              cameraControls.stop()
              streamRef.current?.getTracks().forEach((track) => track.stop())
              streamRef.current = null
              return
            }

            if (error && !(error instanceof NotFoundException)) {
              setScanStatus('Caméra non compatible, saisissez le code')
            }
          }
        )

        if (cancelled) {
          cameraControls.stop()
          return
        }

        controls = cameraControls

        streamRef.current = (video.srcObject as MediaStream | null) ?? null
      } catch {
        setScanStatus('Autorisez la caméra ou saisissez un code')
      }
    }

    startCamera()

    return () => {
      cancelled = true
      controls?.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [isScannerOpen])

  const lookupProduct = useCallback(async (code: string) => {
    if (!code) return
    setScanStatus('Recherche du produit...')
    try { const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`); const data = await response.json(); if (data.status !== 1) throw new Error('not found'); const foundProduct = { name: data.product.product_name_fr || data.product.product_name || 'Produit trouvé', brand: data.product.brands, nutriscore: data.product.nutriscore_grade?.toUpperCase(), image: data.product.image_front_url || data.product.image_front_small_url || data.product.image_url }; setProduct(foundProduct); updatePantry([...pantry.filter((item) => item.barcode !== code), { barcode: code, ...foundProduct, addedAt: Date.now() }]); setScanStatus('Produit identifié et ajouté au frigo') } catch { setScanStatus('Produit introuvable pour ce code'); setProduct(null) }
  }, [pantry])

  useEffect(() => {
    lookupProductRef.current = lookupProduct
  }, [lookupProduct])

  const handleBarcodeSearch = useCallback((codeOverride?: string) => {
    const normalizedCode = (codeOverride ?? barcode).replace(/\D/g, '').trim()
    if (!normalizedCode) {
      setScanStatus('Saisissez un code-barres')
      return
    }
    if (normalizedCode === lastSearchedCodeRef.current) {
      return
    }
    lastSearchedCodeRef.current = normalizedCode
    lookupProduct(normalizedCode)
  }, [barcode, lookupProduct])

  useEffect(() => {
    const normalizedCode = barcode.replace(/\D/g, '').trim()
    if (!normalizedCode || normalizedCode.length < 8) return

    const timeoutId = window.setTimeout(() => {
      if (normalizedCode === lastSearchedCodeRef.current) {
        return
      }
      handleBarcodeSearch(normalizedCode)
    }, 400)

    return () => window.clearTimeout(timeoutId)
  }, [barcode, handleBarcodeSearch])

  const openComponent = (id: string) => setSelectedComponent(componentInfo[id])

  return (
    <main>
      <header className="topbar"><a className="brand" href="#saison" aria-label="Accueil"><span className="brand-mark"><Leaf size={18} strokeWidth={2.5} /></span><span>Comment est votre<br /><strong>blanquette</strong></span></a><nav aria-label="Navigation principale">{navItems.map((item) => <button className={activeNav === item ? 'nav-link active' : 'nav-link'} key={item} onClick={() => { setActiveNav(item); if (item === 'Scanner') setIsScannerOpen(true); if (item === 'Frigo') document.getElementById('frigo')?.scrollIntoView({ behavior: 'smooth' }); if (item === 'Recettes') document.getElementById('recettes')?.scrollIntoView({ behavior: 'smooth' }) }}>{item}</button>)}</nav><button className="icon-button help" aria-label="Aide"><CircleHelp size={20} /></button><button className="menu-button" aria-label="Ouvrir le menu"><Menu size={22} /></button></header>
      <section className="hero-section" id="saison"><div className="hero-copy"><p className="eyebrow"><span></span> Le calendrier de la nature</p><h1>Bien manger,<br /><em>c’est de saison.</em></h1><p className="hero-description">Le bon produit au bon moment. Découvrez ce que la terre nous offre aujourd’hui, simplement.</p><div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' })}>Voir le catalogue <ArrowRight size={17} /></button><button className="text-button" onClick={() => setIsScannerOpen(true)}><ScanLine size={17} /> Scanner un produit</button></div></div><div className="hero-art" aria-hidden="true"><div className="sun"></div><div className="leaf-shape leaf-one"></div><div className="leaf-shape leaf-two"></div><div className="fruit-orb tomato"></div><div className="fruit-orb peach"></div><div className="art-caption">Cueilli<br /><strong>maintenant</strong></div></div></section>
      <section className="season-strip"><div><span className="season-icon">☀</span><strong>Fin d’été</strong><span>•</span><span>Août — Septembre</span></div><button>Changer de saison <ChevronDown size={16} /></button></section>
      <section className="fridge-section" id="frigo"><div className="section-heading fridge-heading"><div><p className="eyebrow"><span></span> Votre cuisine</p><h2>Le frigo<br /><em>en vue.</em></h2></div><div className="fridge-count"><strong>{pantry.length}</strong><span>{pantry.length === 1 ? 'produit conservé' : 'produits conservés'}</span></div></div><div className="fridge-layout"><div className="fridge-illustration"><div className="fridge-top"><span>BLANQUETTE</span></div><div className="fridge-body"><div className="fridge-shelf shelf-one">{pantry.slice(0, 4).map((item) => <div className="fridge-item" key={item.barcode}><div className="fridge-item-image">{item.image ? <img src={item.image} alt="" /> : <Leaf size={22} />}</div><span>{item.name.replace(/^Le |^La |^L’|^Les /, '')}</span><button onClick={() => removeFromPantry(item.barcode)} aria-label={`Retirer ${item.name}`}><X size={11} /></button></div>)}</div><div className="fridge-shelf shelf-two">{pantry.slice(4, 8).map((item) => <div className="fridge-item" key={item.barcode}><div className="fridge-item-image">{item.image ? <img src={item.image} alt="" /> : <Leaf size={22} />}</div><span>{item.name.replace(/^Le |^La |^L’|^Les /, '')}</span><button onClick={() => removeFromPantry(item.barcode)} aria-label={`Retirer ${item.name}`}><X size={11} /></button></div>)}</div></div></div><div className="fridge-copy">{pantry.length === 0 ? <><p className="fridge-kicker">Votre garde-manger est encore calme</p><h3>Scannez un produit<br /><em>pour commencer.</em></h3><p>Chaque produit identifié rejoint automatiquement votre frigo. Il restera là pour vous aider à décider quoi cuisiner.</p><button className="secondary-button" onClick={() => setIsScannerOpen(true)}>Ajouter mon premier produit <ScanLine size={16} /></button></> : <><p className="fridge-kicker">Votre inventaire vivant</p><h3>Vous avez déjà<br /><em>de quoi cuisiner.</em></h3><p>{pantry.length} produits sont prêts à inspirer votre prochain repas. Retirez un produit quand il n’est plus dans votre cuisine.</p><button className="text-button" onClick={() => document.getElementById('recettes')?.scrollIntoView({ behavior: 'smooth' })}>Voir les idées de repas <ArrowRight size={16} /></button></>}</div></div></section>
      <section className="recipes-section" id="recettes"><div className="section-heading"><div><p className="eyebrow"><span></span> L’inspiration du soir</p><h2>Qu’est-ce qu’on<br /><em>mange ?</em></h2></div><p className="recipe-intro">Des recettes choisies selon ce que vous avez déjà dans votre frigo.</p></div><div className="recipe-grid">{suggestedRecipes.map((recipe) => <article className="recipe-card" key={recipe.name}><div className="recipe-image" style={{ backgroundImage: `url(${recipe.image})` }}><span>{recipe.time}</span></div><div className="recipe-content"><p className="recipe-type">{recipe.type}</p><h3>{recipe.name}</h3><p>{recipe.description}</p><div className="recipe-match"><strong>{recipe.owned.length}/{recipe.ingredients.length}</strong><span>ingrédients disponibles</span></div><div className="recipe-ingredients">{recipe.ingredients.map((ingredient) => <span className={recipe.owned.some((owned) => owned === ingredient) ? 'owned' : ''} key={ingredient}>{ingredient}</span>)}</div></div></article>)}</div></section>
      <section className="content-section catalogue-section" id="catalogue"><div className="section-heading"><div><p className="eyebrow"><span></span> La grande liste</p><h2>Tout ce qui est<br /><em>à croquer</em></h2></div><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Chercher un aliment..." aria-label="Rechercher un aliment" /></div></div><div className="catalogue-toolbar"><div className="category-tabs" role="tablist" aria-label="Catégories d’aliments">{categories.map((item) => <button className={category === item ? 'category-tab active' : 'category-tab'} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="view-toggle" aria-label="Mode d’affichage"><button className={view === 'grid' ? 'view-button active' : 'view-button'} onClick={() => setView('grid')} aria-label="Vue en grille"><Grid2X2 size={16} /></button><button className={view === 'list' ? 'view-button active' : 'view-button'} onClick={() => setView('list')} aria-label="Vue en liste"><List size={17} /></button></div></div><p className="catalogue-count">{filteredProduce.length} aliments dans {category === 'Tous' ? 'toutes les catégories' : category.toLowerCase()}</p><div className={`produce-grid ${view === 'list' ? 'list-view' : ''}`}>{filteredProduce.map((item) => <article className="produce-card" key={item.name}><div className="produce-image" style={{ backgroundImage: `url(${item.image})`, backgroundColor: `${item.color}18` }}><span style={{ backgroundColor: item.color }}>{item.note}</span></div><div className="produce-info"><div><p>{item.type} · {item.category}</p><h3>{item.name}</h3><div className="component-chips">{item.components.map((component) => <button key={component} onClick={() => openComponent(component)}>{componentInfo[component].name}</button>)}</div></div><button className="round-arrow" aria-label={`Voir ${item.name}`}><ArrowRight size={18} /></button></div></article>)}</div>{filteredProduce.length === 0 && <p className="empty-state">Aucun aliment ne correspond à votre recherche.</p>}</section>
      <section className="component-banner"><div><p className="eyebrow"><span></span> Lire les étiquettes autrement</p><h2>Chaque composant<br /><em>raconte quelque chose.</em></h2><p>Cliquez sur une fibre, une vitamine ou un minéral pour comprendre son rôle, ses bénéfices et les points à surveiller.</p></div><div className="component-orbit"><span>Fibres</span><span>Vitamine C</span><span>Fer</span><span>Polyphénols</span><Info size={22} /></div></section>
      <section className="scanner-promo"><div className="scanner-icon"><Camera size={24} /></div><div><p className="eyebrow"><span></span> Dans votre cuisine</p><h2>Un doute sur un produit ?<br /><em>On vous dit tout.</em></h2><p>Scannez son code-barres pour connaître sa composition, son Nutri-Score et bien plus encore.</p></div><button className="secondary-button" onClick={() => setIsScannerOpen(true)}>Ouvrir le scanner <ScanLine size={17} /></button></section>
      <footer><span>© 2026 Comment est votre blanquette</span><span>Le goût des choses simples <Sparkles size={14} /></span></footer>
      {selectedComponent && <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelectedComponent(null) }}><section className="component-modal" role="dialog" aria-modal="true" aria-labelledby="component-title"><button className="close-button" onClick={() => setSelectedComponent(null)} aria-label="Fermer"><X size={20} /></button><p className="eyebrow"><span></span> Décryptage nutritionnel</p><h2 id="component-title">{selectedComponent.name}</h2><p className="component-kind">{selectedComponent.kind}</p><p className="component-summary">{selectedComponent.summary}</p><div className="detail-columns"><div><h3><Check size={16} /> Les bénéfices</h3><ul>{selectedComponent.benefits.map((benefit) => <li key={benefit}>{benefit}</li>)}</ul></div><div><h3 className="caution-title"><Info size={16} /> À garder en tête</h3><ul>{selectedComponent.cautions.map((caution) => <li key={caution}>{caution}</li>)}</ul></div></div><small>Informations générales, à replacer dans une alimentation variée.</small></section></div>}
      {isScannerOpen && <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setIsScannerOpen(false) }}><section className="scanner-modal" role="dialog" aria-modal="true" aria-labelledby="scanner-title"><button className="close-button" onClick={() => setIsScannerOpen(false)} aria-label="Fermer"><X size={20} /></button><p className="eyebrow"><span></span> Lecture intelligente</p><h2 id="scanner-title">Votre produit,<br /><em>en clair.</em></h2><div className="camera-frame"><video ref={videoRef} autoPlay playsInline muted /><div className="scan-corners"></div><span>{scanStatus}</span></div><form onSubmit={(event) => { event.preventDefault(); handleBarcodeSearch() }} className="barcode-form"><input value={barcode} onChange={(event) => setBarcode(event.target.value.replace(/\D/g, ''))} placeholder="Ou saisissez le code-barres" inputMode="numeric" aria-label="Code-barres du produit" /><button type="submit" className="primary-button"><Search size={17} /> Chercher</button></form>{product && <div className="product-result"><div className="product-visual">{product.image ? <img src={product.image} alt={`Emballage de ${product.name}`} /> : <div className="product-image-placeholder"><Leaf size={32} /></div>}<p className="result-label"><Check size={14} /> Produit identifié</p><h3>{product.name}</h3><p>{product.brand || 'Marque non renseignée'}</p></div>{product.nutriscore && <div className="nutriscore-block"><div className="nutriscore-brand">NUTRI-SCORE</div><div className="nutriscore-scale" aria-label={`Nutri-Score ${product.nutriscore}`} role="img">{['A', 'B', 'C', 'D', 'E'].map((score) => <span className={`nutriscore-item score-${score.toLowerCase()} ${product.nutriscore === score ? 'selected' : ''}`} key={score}>{score}</span>)}</div></div>}</div>}<small>Données produits fournies par Open Food Facts</small></section></div>}
    </main>
  )
}

export default App
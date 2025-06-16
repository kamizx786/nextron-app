import ImagePredictor from "../components/ImagePredictor"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-2">Agri Wheat  Disease Detection</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload an image of a wheat  to detect diseases and get treatment recommendations
          </p>
        </header>

        <ImagePredictor />

        <AboutSection />

        <DiseaseClasses />

        <DisclaimerSection />
      </div>
    </main>
  )
}

function AboutSection() {
  return (
    <section className="my-16 bg-white rounded-xl shadow-md p-6 md:p-8">
      <h2 className="text-2xl font-bold text-green-800 mb-4">About Our Application</h2>
      <div className="prose max-w-none text-gray-700">
        <p>
          Our Wheat Leaf Disease Detection application uses advanced machine learning to help farmers and agricultural
          professionals identify common wheat diseases quickly and accurately. Early detection is crucial for preventing
          crop loss and implementing timely interventions.
        </p>
        <p className="mt-3">
          Simply upload a clear image of a wheat leaf, and our AI model will analyze it to identify potential diseases.
          The system can detect four common wheat conditions and provides recommendations for treatment and management
          when a disease is identified.
        </p>
        <p className="mt-3">
          This tool is designed to be a supportive resource for preliminary diagnosis, helping to guide further
          investigation and professional consultation.
        </p>
      </div>
    </section>
  )
}

function DiseaseClasses() {
  const diseases = [
    {
      name: "Crown and Root Rot",
      description:
        "A fungal disease affecting the crown and root system of wheat plants. It causes browning and rotting of the crown tissue and roots, leading to stunted growth and eventual plant death.",
      symptoms: "Browning of crown and roots, stunted growth, yellowing leaves, and wilting plants.",
    },
    {
      name: "Healthy Wheat",
      description:
        "Properly developed wheat plants with no signs of disease or stress. Healthy wheat exhibits vibrant green leaves, strong stems, and normal growth patterns.",
      symptoms: "Vibrant green color, uniform growth, and absence of spots, lesions, or discoloration.",
    },
    {
      name: "Leaf Rust",
      description:
        "A common fungal disease characterized by orange-brown pustules on wheat leaves. It reduces photosynthetic area and can significantly impact yield if infection is severe.",
      symptoms:
        "Orange-brown pustules on leaves, chlorosis around infection sites, and premature leaf death in severe cases.",
    },
    {
      name: "Wheat Loose Smut",
      description:
        "A fungal disease that affects wheat heads, replacing normal grain with black spores. The disease is seed-borne and can cause significant yield losses if not managed.",
      symptoms: "Black, powdery spore masses replacing normal grain heads, and sometimes stunted plant growth.",
    },
  ]

  return (
    <section className="my-16">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Diseases Our Model Can Detect</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {diseases.map((disease) => (
          <div
            key={disease.name}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-green-800 mb-2">{disease.name}</h3>
            <p className="text-gray-700 mb-3">{disease.description}</p>
            <div>
              <span className="font-medium text-green-700">Common symptoms: </span>
              <span className="text-gray-600">{disease.symptoms}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function DisclaimerSection() {
  return (
    <section className="my-16 bg-amber-50 rounded-xl p-6 border border-amber-200">
      <h2 className="text-xl font-bold text-amber-800 mb-3">Disclaimer</h2>
      <div className="text-amber-700">
        <p>
          This application is designed as a preliminary diagnostic tool and should not replace professional agricultural
          consultation. The accuracy of predictions depends on image quality, lighting conditions, and the specific
          presentation of symptoms.
        </p>
        <p className="mt-2">
          Always consult with agricultural experts or plant pathologists for confirmation of disease diagnosis and
          appropriate treatment recommendations. Improper treatment based solely on this tool's predictions could lead
          to ineffective disease management or unnecessary chemical applications.
        </p>
        <p className="mt-2">
          The developers of this application are not responsible for any crop losses or damages resulting from actions
          taken based on the predictions provided.
        </p>
      </div>
    </section>
  )
}

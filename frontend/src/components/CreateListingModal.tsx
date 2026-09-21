import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { X, Upload, Trash2, Plus, Minus, Waves, Home, Palmtree, Castle, Building2, Tent, Sailboat, Sparkles } from 'lucide-react';
import { CREATE_LISTING_MUTATION } from '../graphql/mutations';
import { GET_LISTINGS } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const CATEGORY_OPTIONS = [
  { id: 'Amazing pools', name: 'Piscines remarquables', icon: Waves },
  { id: 'Cabins', name: 'Cabanes & Chalets', icon: Home },
  { id: 'Beachfront', name: 'Bord de mer', icon: Palmtree },
  { id: 'Mansions', name: 'Demeures d\'exception', icon: Castle },
  { id: 'Iconic cities', name: 'Villes emblématiques', icon: Building2 },
  { id: 'Tropical', name: 'Tropical & Forêt', icon: Sparkles },
  { id: 'Lakefront', name: 'Au bord du lac', icon: Sailboat },
  { id: 'Camping', name: 'Campings insolites', icon: Tent },
];

const PROPERTY_TYPES = [
  'Logement entier',
  'Chambre privée',
  'Villa de luxe',
  'Chalet alpin',
  'Maison de plage',
  'Penthouse'
];

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState('Beachfront');
  const [propertyType, setPropertyType] = useState('Logement entier');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Canada');
  const [address, setAddress] = useState('');
  const [maxGuests, setMaxGuests] = useState(2);
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerNight, setPricePerNight] = useState<number>(150);
  const [cleaningFee, setCleaningFee] = useState<number>(30);

  const [createListing] = useMutation(CREATE_LISTING_MUTATION, {
    refetchQueries: [{ query: GET_LISTINGS }],
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      let imageInputs: Array<{ url: string; publicId?: string; isCover: boolean; displayOrder: number }> = [];

      // 1. Upload files to REST API if any selected
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('files', file));

        const uploadRes = await fetch('http://localhost:5193/api/upload/images', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || "Échec de l'upload des images sur Cloudinary");
        }

        const uploadData = await uploadRes.json();
        imageInputs = uploadData.urls.map((url: string, idx: number) => ({
          url,
          publicId: uploadData.publicIds[idx] || undefined,
          isCover: idx === 0,
          displayOrder: idx,
        }));
      } else {
        // Fallback quality image
        imageInputs = [{
          url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          isCover: true,
          displayOrder: 0,
        }];
      }

      // 2. Execute GraphQL Mutation
      await createListing({
        variables: {
          input: {
            title: title.trim(),
            description: description.trim(),
            category,
            propertyType,
            city: city.trim(),
            country: country.trim(),
            address: address.trim(),
            latitude: 45.5017,
            longitude: -73.5673,
            pricePerNight: Number(pricePerNight),
            cleaningFee: Number(cleaningFee),
            maxGuests,
            bedrooms,
            beds,
            bathrooms,
            images: imageInputs,
          },
        },
      });

      onSuccess('Votre logement a été publié avec succès !');
      onClose();
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de la création de l'annonce.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500 hover:text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h3 className="font-bold text-base text-airbnb-dark">Créer une nouvelle annonce</h3>
            <p className="text-xs text-airbnb-gray">Étape {step} sur 5</p>
          </div>
          <div className="w-8" />
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-neutral-100 h-1">
          <div
            className="bg-gradient-to-r from-cyan-500 to-teal-500 h-1 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
              {error}
            </div>
          )}

          {/* STEP 1: Category & Property Type */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h4 className="text-lg font-bold text-airbnb-dark mb-1">
                  Parmi ces propositions, laquelle décrit le mieux votre logement ?
                </h4>
                <p className="text-xs text-airbnb-gray mb-4">Sélectionnez une catégorie principale</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col gap-2 transition cursor-pointer ${
                          isSelected
                            ? 'border-airbnb-dark bg-neutral-50 ring-2 ring-airbnb-dark'
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <Icon className="w-5 h-5 text-airbnb-dark" />
                        <span className="text-xs font-semibold text-airbnb-dark">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-airbnb-dark mb-2">Type d'hébergement</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPropertyType(type)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        propertyType === type
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700 font-bold shadow-2xs'
                          : 'border-neutral-200 text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-lg font-bold text-airbnb-dark">Où est situé votre logement ?</h4>
              <p className="text-xs text-airbnb-gray mb-2">Votre adresse précise ne sera communiquée qu'aux voyageurs ayant une réservation confirmée.</p>
              
              <div>
                <label className="block text-xs font-semibold text-airbnb-dark mb-1">Adresse complète</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 123 Rue de la Montagne"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-airbnb-dark"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-airbnb-dark mb-1">Ville</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Montréal, Québec, Vancouver..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-airbnb-dark"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-airbnb-dark mb-1">Pays</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Canada"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-airbnb-dark"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Capacity */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-lg font-bold text-airbnb-dark">Donnez les informations de base sur votre logement</h4>
              <p className="text-xs text-airbnb-gray mb-4">Combien de voyageurs pouvez-vous accueillir ?</p>

              {[
                { label: 'Voyageurs max', value: maxGuests, set: setMaxGuests, min: 1 },
                { label: 'Chambres', value: bedrooms, set: setBedrooms, min: 1 },
                { label: 'Lits', value: beds, set: setBeds, min: 1 },
                { label: 'Salles de bain', value: bathrooms, set: setBathrooms, min: 1 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-neutral-100">
                  <span className="text-sm font-semibold text-airbnb-dark">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={item.value <= item.min}
                      onClick={() => item.set(Math.max(item.min, item.value - 1))}
                      className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm">{item.value}</span>
                    <button
                      type="button"
                      onClick={() => item.set(item.value + 1)}
                      className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:border-neutral-900 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: Photos Upload */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-lg font-bold text-airbnb-dark">Ajoutez des photos de votre logement</h4>
              <p className="text-xs text-airbnb-gray">Vous avez besoin d'au moins une photo pour commencer. Elles seront automatiquement hébergées sur Cloudinary.</p>

              <label className="border-2 border-dashed border-neutral-300 hover:border-cyan-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-neutral-50/50 hover:bg-cyan-50/30 transition">
                <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-sm text-airbnb-dark">Cliquez pour importer des photos</span>
                  <p className="text-xs text-airbnb-gray mt-1">PNG, JPG, WEBP jusqu'à 50 Mo</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Previews grid */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-neutral-200">
                      <img src={url} alt={`Aperçu ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 bg-airbnb-dark/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Photo de couverture
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Title, Description & CAD Pricing */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-lg font-bold text-airbnb-dark">Dernière étape : Titre, description & tarif</h4>

              <div>
                <label className="block text-xs font-semibold text-airbnb-dark mb-1">Titre de l'annonce</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Chalet en bord de lac avec vue spectaculaire"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-airbnb-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-airbnb-dark mb-1">Description détaillée</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Décrivez ce qui rend votre logement unique, l'ambiance et les équipements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-sm focus:outline-hidden focus:border-airbnb-dark"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50">
                  <label className="block text-xs font-bold text-airbnb-dark mb-1">Prix par nuit ($ CAD)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={10}
                      max={10000}
                      value={pricePerNight}
                      onChange={(e) => setPricePerNight(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-lg font-bold text-airbnb-dark bg-white"
                    />
                    <span className="text-sm font-semibold text-airbnb-gray shrink-0">$ CAD</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50">
                  <label className="block text-xs font-bold text-airbnb-dark mb-1">Frais de ménage ($ CAD)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={cleaningFee}
                      onChange={(e) => setCleaningFee(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-lg font-bold text-airbnb-dark bg-white"
                    />
                    <span className="text-sm font-semibold text-airbnb-gray shrink-0">$ CAD</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 bg-white">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 hover:border-neutral-900 text-sm font-semibold text-airbnb-dark transition cursor-pointer"
            >
              Retour
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 2 && (!city.trim() || !address.trim())) {
                  setError("Veuillez renseigner l'adresse et la ville.");
                  return;
                }
                setError(null);
                setStep((s) => s + 1);
              }}
              className="px-6 py-2.5 rounded-xl bg-airbnb-dark text-white text-sm font-semibold hover:bg-black transition cursor-pointer"
            >
              Continuer
            </button>
          ) : (
            <button
              type="button"
              disabled={loading || !title.trim() || !description.trim() || pricePerNight <= 0}
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white text-sm font-semibold hover:opacity-95 disabled:opacity-50 transition shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-2"
            >
              {loading ? 'Publication en cours...' : 'Publier mon annonce'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

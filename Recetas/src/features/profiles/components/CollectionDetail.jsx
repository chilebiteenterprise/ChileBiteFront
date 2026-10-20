import { useState, useEffect } from "react";
import RecipeGrid from "../../recipes/components/RecipeGrid";

export default function CollectionDetail() {
    const [collectionId, setCollectionId] = useState(null);
    const [collectionName, setCollectionName] = useState("");

    useEffect(() => {
        // Ejecutamos solo en el cliente para obtener los parámetros
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const id = params.get("id");
            const name = params.get("name") || "Colección";
            setCollectionId(id);
            setCollectionName(name);
        }
    }, []);

    // Evitamos renderizar agresivamente RecipeGrid hasta que sepamos el ID (para no disparar requests sueltos)
    if (!collectionId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-20 animate-pulse text-text-muted">
                <div className="w-12 h-12 border-4 border-border-subtle border-t-brand-primary dark:border-t-[#f0a262] rounded-full animate-spin mb-4" />
                <p className="font-bold text-sm tracking-widest uppercase text-text-muted">Cargando recetas...</p>
            </div>
        );
    }

    return (
        <RecipeGrid collectionId={collectionId} collectionTitle={`Tus Recetas de: ${collectionName}`} />
    );
}

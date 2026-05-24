

export default function Map() {
    return (
        <div className="bg-white border-4 border-black rounded-2xl p-2 shadow-[8px_8px_0px_0px_#000] h-[65vh] relative overflow-hidden">
            {/* L'iframe est un espace réservé pour le moment */}
            <div className="w-full h-full bg-blue-50 border-2 border-dashed border-black rounded-xl flex items-center justify-center flex-col">
                <iframe className="w-full h-full" src='https://map.timote.ovh'></iframe>
            </div>
        </div>
    );
}

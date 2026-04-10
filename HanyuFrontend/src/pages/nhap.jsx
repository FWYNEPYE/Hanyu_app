{activeWord && !isSelectingGroup && (
                    <>
                        <div className="fixed inset-0 z-[400]" onClick={() => setActiveWord(null)}></div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1, transform: 'translate(-50%, calc(-100% - 15px))'}} 
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed z-[410] bg-[#FF4D00] rounded-[1.5rem] p-4 shadow-2xl w-[220px] text-center"
                            style={{ left: `${popoverPos.x}px`, top: `${popoverPos.y}px`, transform: 'translate(-50%, calc(-100% - 15px))' }}
                        >
                            <div className="relative flex justify-center items-center mb-1 text-white">
                                <span className="text-2xl font-black">{activeWord.char || activeWord.text}</span>
                                <button onClick={() => speakChinese(activeWord.char || activeWord.text)} className="absolute right-0 hover:scale-110 transition-transform">
                                    <IoVolumeHighOutline size={18} />
                                </button>
                            </div>
                            <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-2">/ {activeWord.pinyin} /</p>
                            <div className="bg-white/20 p-2 rounded-md mb-3">
                                <p className="text-[11px] text-white font-medium italic">"{activeWord.vi || activeWord.mean}"</p>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsSelectingGroup(true); }}
                                className="w-full bg-white text-[#FF4D00] py-2 rounded-xl text-[10px] font-black uppercase shadow-sm hover:bg-orange-50"
                            >
                                + Lưu từ vựng
                            </button>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-8px] w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-[#FF4D00]"></div>
                        </motion.div>
                    </>
                )}

                {/* 2. Modal chọn bộ từ (Hiện ra giữa màn hình) */}
                {isSelectingGroup && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            onClick={() => setIsSelectingGroup(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
                        
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative z-[510]"
                        >
                            {/* Header Modal */}
                            <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-xl"><IoFolderOpenOutline size={20}/></div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-sm uppercase">Lưu vào bộ từ</h3>
                                        <p className="text-[10px] text-slate-400 font-bold">Từ đang chọn: {activeWord?.char || activeWord?.text}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsSelectingGroup(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <IoCloseOutline size={24}/>
                                </button>
                            </div>

                            <div className="p-6">
                                {/* Tạo bộ từ mới */}
                                <div className="flex gap-2 mb-6">
                                    <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                                        placeholder="Tên bộ từ mới..." 
                                        className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-blue-500/20 font-medium" />
                                    <button onClick={handleCreateGroup} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-blue-700 transition-all">TẠO</button>
                                </div>

                                {/* Danh sách bộ từ */}
                                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {vocabGroups.length > 0 ? (
                                        vocabGroups.map((g) => (
                                            <button key={g.categoryID} onClick={() => saveWordToGroup(g.categoryID)}
                                                className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all group"
                                            >
                                                <span className="font-bold text-slate-700 group-hover:text-blue-600">{g.categoryName}</span>
                                                <IoAddCircleOutline size={20} className="text-slate-300 group-hover:text-blue-500"/>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 text-slate-400 italic text-sm">Bạn chưa có bộ từ nào. Hãy tạo bộ mới ở trên!</div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
import React from 'react';

const SubtitleBox = ({ showPinyin, showTranslation }) => {
  // Mock subtitle data
  const subtitles = [
    { chinese: '你好', pinyin: 'nǐ hǎo', vietnamese: 'Xin chào' },
    { chinese: '谢谢', pinyin: 'xiè xiè', vietnamese: 'Cảm ơn' },
    { chinese: '再见', pinyin: 'zài jiàn', vietnamese: 'Tạm biệt' },
    { chinese: '对不起', pinyin: 'duì bù qǐ', vietnamese: 'Xin lỗi' },
    { chinese: '请问', pinyin: 'qǐng wèn', vietnamese: 'Xin hỏi' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Phụ đề AI</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {subtitles.map((subtitle, index) => (
          <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
            <div className="text-xl font-bold text-blue-800 mb-1">
              {subtitle.chinese}
            </div>
            {showPinyin && (
              <div className="text-sm text-blue-600 font-medium mb-1">
                {subtitle.pinyin}
              </div>
            )}
            {showTranslation && (
              <div className="text-sm text-gray-700">
                {subtitle.vietnamese}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubtitleBox;
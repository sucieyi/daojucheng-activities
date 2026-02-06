const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const GAMES = [
  { name: '王者荣耀', url: 'https://pvp.qq.com/web201605/newsindex.shtml' },
  { name: '和平精英', url: 'https://game.peace.qq.com/news/index.html' },
  { name: '英雄联盟', url: 'https://lol.qq.com/news/index.shtml' },
  { name: '穿越火线', url: 'https://cf.qq.com/news/index.shtml' },
  { name: 'DNF地下城与勇士', url: 'https://dnf.qq.com/main.shtml' },
  { name: 'QQ飞车', url: 'https://speed.qq.com/main.shtml' },
  { name: '天涯明月刀', url: 'https://wuxia.qq.com/main.shtml' }
];

async function main() {
  console.log('🚀 开始抓取游戏活动...');
  const allActivities = [];
  
  for (const game of GAMES) {
    try {
      console.log(`📡 抓取 ${game.name}...`);
      const response = await axios.get(game.url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const keywords = ['版本', '更新', '赛季', '活动', '上线', '福利', '限时'];
      
      const titles = [];
      $('a').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text.length > 10 && keywords.some(kw => text.includes(kw))) {
          titles.push(text);
        }
      });
      
      const now = new Date();
      const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      titles.slice(0, 2).forEach(title => {
        let type = '限时活动';
        if (title.includes('版本')) type = '版本更新';
        else if (title.includes('赛季')) type = '赛季开启';
        else if (title.includes('上线')) type = '新玩法上线';
        else if (title.includes('福利')) type = '限时福利';
        
        let reward = '游戏道具';
        if (title.includes('皮肤')) reward = '皮肤、游戏点券';
        else if (title.includes('英雄')) reward = '英雄、游戏点券';
        else if (title.includes('福利')) reward = 'Q币、游戏点券';
        
        allActivities.push({
          gameName: game.name,
          activityType: type,
          activityTime: `${now.toISOString().split('T')[0]} 至 ${future.toISOString().split('T')[0]}`,
          coreFeatures: title,
          rewardType: reward,
          participationMethod: '登录游戏参与活动，完成任务领取奖励',
          sourceUrl: game.url,
          fetchTime: now.toISOString()
        });
      });
      
      console.log(`✅ ${game.name}: ${titles.length}个活动`);
    } catch (error) {
      console.error(`❌ ${game.name} 失败:`, error.message);
    }
  }
  
  console.log(`\n✅ 总计: ${allActivities.length}个活动`);
  fs.writeFileSync('activities.json', JSON.stringify(allActivities, null, 2));
  console.log('💾 数据已保存到 activities.json');
}

main().catch(console.error);

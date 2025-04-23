
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MarketPage = () => {
  // Mock data for price trends
  const priceData = [
    { name: 'Jan', wheat: 330, corn: 300, rice: 400 },
    { name: 'Feb', wheat: 300, corn: 310, rice: 380 },
    { name: 'Mar', wheat: 310, corn: 320, rice: 390 },
    { name: 'Apr', wheat: 340, corn: 330, rice: 410 },
    { name: 'May', wheat: 350, corn: 340, rice: 390 },
    { name: 'Jun', wheat: 370, corn: 350, rice: 420 },
  ];

  const marketInsights = [
    {
      crop: 'Wheat',
      price: '$7.25/bushel',
      trend: 'up',
      change: '+3.2%',
      icon: <TrendingUp className="h-5 w-5 text-green-600" />
    },
    {
      crop: 'Corn',
      price: '$5.80/bushel',
      trend: 'up',
      change: '+1.5%',
      icon: <TrendingUp className="h-5 w-5 text-green-600" />
    },
    {
      crop: 'Soybeans',
      price: '$14.20/bushel',
      trend: 'down',
      change: '-0.8%',
      icon: <TrendingDown className="h-5 w-5 text-red-600" />
    },
    {
      crop: 'Rice',
      price: '$21.50/cwt',
      trend: 'down',
      change: '-1.2%',
      icon: <TrendingDown className="h-5 w-5 text-red-600" />
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Market Prices</h1>
          <p className="text-muted-foreground">Track agricultural commodity prices and market trends</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          {marketInsights.map((item, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.crop}</CardTitle>
                <CardDescription>Current Market Price</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{item.price}</div>
                    <div className={`text-sm ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change} today
                    </div>
                  </div>
                  {item.icon}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div>
              <CardTitle>Price Trends</CardTitle>
              <CardDescription>6 month commodity price history</CardDescription>
            </div>
            <BarChart3 className="ml-auto h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="wheat" stackId="1" stroke="#fbbf24" fill="#fcd34d" />
                  <Area type="monotone" dataKey="corn" stackId="1" stroke="#16a34a" fill="#86efac" />
                  <Area type="monotone" dataKey="rice" stackId="1" stroke="#2563eb" fill="#93c5fd" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Market News</CardTitle>
              <CardDescription>Latest agricultural market updates</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li>
                  <div className="font-medium">Wheat futures climb on export demand</div>
                  <div className="text-sm text-muted-foreground">2 hours ago</div>
                </li>
                <li>
                  <div className="font-medium">Corn prices stabilize after recent volatility</div>
                  <div className="text-sm text-muted-foreground">5 hours ago</div>
                </li>
                <li>
                  <div className="font-medium">Global rice production expected to increase in next quarter</div>
                  <div className="text-sm text-muted-foreground">1 day ago</div>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <CardTitle>Trading Opportunities</CardTitle>
              </div>
              <CardDescription>Based on current market conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li>
                  <div className="font-medium">Consider forward contracts for wheat</div>
                  <div className="text-sm text-muted-foreground">Prices expected to rise over next 30 days</div>
                </li>
                <li>
                  <div className="font-medium">Monitor soybean futures closely</div>
                  <div className="text-sm text-muted-foreground">Potential buying opportunity if decline continues</div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default MarketPage;

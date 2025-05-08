import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { ShoppingCart, Ticket, Gift } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

// Use import.meta.env instead of process.env for Vite
const PRICE_IDS = {
  TICKET_1: process.env.REACT_APP_STRIPE_PRICE_ID_1 || 'price_id_1',
  TICKET_3: process.env.REACT_APP_STRIPE_PRICE_ID_3 || 'price_id_3',
  TICKET_10: process.env.REACT_APP_STRIPE_PRICE_ID_10 || 'price_id_10'
};


const VIP = () => {
  const { toast } = useToast();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const getPriceId = (ticketCount: number): string => {
    console.log(`Getting price ID for ticket count: ${ticketCount}`); // Log ticket count
    switch (ticketCount) {
      case 1:
        console.log(`Price ID for 1 ticket: ${PRICE_IDS.TICKET_1}`); // Log price ID for 1 ticket
        return PRICE_IDS.TICKET_1;
      case 3:
        console.log(`Price ID for 3 tickets: ${PRICE_IDS.TICKET_3}`); // Log price ID for 3 tickets
        return PRICE_IDS.TICKET_3;
      case 10:
        console.log(`Price ID for 10 tickets: ${PRICE_IDS.TICKET_10}`); // Log price ID for 10 tickets
        return PRICE_IDS.TICKET_10;
      default:
        throw new Error('Invalid ticket count');
    }
  };

  const [discount, setDiscount] = useState(0); // Discount in percentage (e.g., 0.10 for 10%)
  const [discountedPrices, setDiscountedPrices] = useState({
    TICKET_1: 1.49,
    TICKET_3: 3.99,
    TICKET_10: 12.99,
  });

  const handleApplyDiscount = async () => {
    try {
      const response = await axios.post(`${backendUrl}/validate-discount`, {
        code: discountCode,
      });

      if (response.data.valid) {
        const discount = response.data.discount; // Assume backend returns discount (e.g., 0.10 for 10%)
        setDiscount(discount);
        setDiscountApplied(true);

        // Calculate discounted prices
        const newDiscountedPrices = {
          TICKET_1: 1.49 * (1 - discount),
          TICKET_3: 3.99 * (1 - discount),
          TICKET_10: 12.99 * (1 - discount),
        };
        setDiscountedPrices(newDiscountedPrices);

        toast({
          title: 'Success',
          description: 'Discount code applied successfully!',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Invalid discount code.',
        });
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to apply discount. Please try again.',
      });
    }
  };

  const handlePurchase = async (ticketCount: number) => {

    try {
      const user_id = localStorage.getItem("user_id");
      const discount_code = discountApplied ? discountCode : null; // Send discount code if valid

      if (!user_id) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'User ID not found. Please log in again.',
        });
        return;
      }

      const priceId = getPriceId(ticketCount);
      console.log(`Price ID for ${ticketCount} tickets: ${priceId}`);

      const response = await axios.post(`${backendUrl}/stripe/create-checkout-session`, {
        user_id: user_id,
        price_id: priceId,
        discount_code: discount_code, // Send discount code to backend
      });

      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        console.error('No URL received from backend');
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No URL received from backend. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error purchasing tickets:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to initiate purchase. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F]">
      <main className="flex-grow py-24 px-4">
        <div className="flex flex-col justify-center items-center text-center mb-8 mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            VIP Tickets
          </h1>
          <p className="text-xl mb-8 max-w-2xl text-white/80">
            Unlock exclusive benefits by purchasing a VIP ticket on AIVisionContest.
            With a VIP ticket, you gain access to premium features that allow you to create and customize your own AI-generated artist.
          </p>
          <p className="text-xl mb-8 max-w-2xl text-white/80">
            You can showcase your creation across your social media channels and other platforms. 
          </p>
          <p className="text-xl mb-8 max-w-2xl text-white/80">
            Whether you're looking to enhance your online presence or turn your creative output into a revenue stream, our VIP experience empowers you to take it to the next level.
          </p>
        </div>

        <p className="text-white/60">
          Purchase VIP tickets to create your AI artist and join the competition!
        </p>

        <div className="flex flex-col items-center mt-8 mb-6">
  <p className="mb-2 neon-text">Got a Coupon?</p>
  <div className="flex items-center w-full max-w-xl">
    <Input
      type="text"
      placeholder="Enter discount code"
      value={discountCode}
      onChange={(e) => setDiscountCode(e.target.value)}
      className="mr-2 flex-grow max-w-md mt-2"
    />
    <Button className="mr-2 mt-2 ml-4" onClick={handleApplyDiscount}>Apply</Button>
  </div>
</div>

        <div className="grid md:grid-cols-3 gap-6 mb-12 mt-6">
          <Card
            className="p-6 border border-primary/20 rounded-xl hover:border-primary/40 cursor-pointer transition-all"
            onClick={() => handlePurchase(1)}
          >
            <CardHeader>
              <Ticket className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-white"><span className="text-secondary">1</span> VIP Ticket</CardTitle>
              <CardDescription className="text-white/60">
                <div className="mb-2">
                  {discountApplied ? (
                    <>
                      <span className="line-through text-2xl">$0.99</span>
                      <span className="ml-2 text-primary text-3xl neon-text">${discountedPrices.TICKET_1.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-2xl">$1.49</span>
                  )}
                </div>
                Create one AI artist.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="p-6 border border-primary/20 rounded-xl hover:border-primary/40 cursor-pointer transition-all"
            onClick={() => handlePurchase(3)}
          >
            <CardHeader>
              <Ticket className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-white"><span className="text-secondary">3 </span> VIP Tickets</CardTitle>
              <CardDescription className="text-white/60">
                <div className="mb-2">
                  {discountApplied ? (
                    <>
                      <span className="line-through text-2xl">$3.99</span>
                      <span className="ml-2 text-primary text-3xl neon-text">${discountedPrices.TICKET_3.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-2xl">$3.99</span>
                  )}
                </div>
                Save and create multiple artists.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="p-6 border border-primary/20 rounded-xl hover:border-primary/40 cursor-pointer transition-all"
            onClick={() => handlePurchase(10)}
          >
            <CardHeader>
              <Ticket className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-white"> <span className="text-secondary">10</span> VIP Tickets</CardTitle>
              <CardDescription className="text-white/60">
                <div className="mb-2">
                  {discountApplied ? (
                    <>
                      <span className="line-through text-2xl">$12.99</span>
                      <span className="ml-2 text-primary text-3xl neon-text">${discountedPrices.TICKET_10.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-2xl">$12.99</span>
                  )}
                </div>
                Save and unlock unlimited creativity.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <p className="mt-8 text-sm text-white/60">
           Each VIP ticket allows you to create one AI artist.
          <Link to="/terms" className="hover:text-primary transition-colors"> Terms</Link> and conditions apply.
        </p>
      </main>
    </div>
  );
};

export default VIP;

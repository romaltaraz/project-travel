import * as React from 'react';
import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FlightCardProps {
  imageUrl: string;
  airline: string;
  flightCode: string;
  flightClass: string;
  departureCode: string;
  departureCity: string;
  departureTime: string;
  arrivalCode: string;
  arrivalCity: string;
  arrivalTime: string;
  date: string;
  duration: string;
  price: number;
  operatingDays: string;
  className?: string;
}

export const FlightCard = React.forwardRef<HTMLDivElement, FlightCardProps>(
  (
    {
      imageUrl,
      airline,
      flightCode,
      flightClass,
      departureCode,
      departureCity,
      departureTime,
      arrivalCode,
      arrivalCity,
      arrivalTime,
      date,
      duration,
      price,
      operatingDays,
      className,
    },
    ref
  ) => {
    const bookingUrl = `https://www.google.com/travel/flights?q=Flights%20from%20${departureCode}%20to%20${arrivalCode}&gl=IL&hl=he`;

    const cardVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          when: 'beforeChildren',
          staggerChildren: 0.1,
        },
      },
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'max-w-sm w-full font-sans rounded-2xl overflow-hidden shadow-lg bg-card border border-border',
          className
        )}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
      >
        {/* Flight Image */}
        <div className="relative h-40">
          <img
            src={imageUrl}
            alt="View from airplane window"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Flight Details Container */}
        <div className="p-6 pt-4">
          {/* Date */}
          <motion.p
            variants={itemVariants}
            className="text-xs font-semibold text-muted-foreground text-center mb-3"
          >
            {date}
          </motion.p>

          {/* Main Flight Route */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between"
          >
            <div className="text-left">
              <p className="text-sm text-muted-foreground">{departureTime}</p>
              <p className="text-4xl font-bold text-card-foreground">
                {departureCode}
              </p>
              <p className="text-xs text-muted-foreground">{departureCity}</p>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">{flightCode}</p>
              <div className="flex items-center gap-2 my-1">
                <div className="h-px w-8 bg-border" />
                <Plane className="h-4 w-4 text-muted-foreground" />
                <div className="h-px w-8 bg-border" />
              </div>
              <p className="text-xs text-muted-foreground">{duration}</p>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">{arrivalTime}</p>
              <p className="text-4xl font-bold text-card-foreground">
                {arrivalCode}
              </p>
              <p className="text-xs text-muted-foreground">{arrivalCity}</p>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="border-t border-dashed border-border my-5"
          />

          {/* Additional Details */}
          <motion.div
            variants={itemVariants}
            className="flex justify-between text-center"
          >
            <InfoItem label="Airline" value={airline} />
            <InfoItem label="Flight Code" value={flightCode} />
            <InfoItem label="Class" value={flightClass} />
          </motion.div>

          {/* Price + Operating days */}
          <motion.div
            variants={itemVariants}
            className="flex items-end justify-between mt-5 pt-5 border-t border-border"
          >
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Operates</p>
              <p className="text-sm font-semibold text-card-foreground">{operatingDays}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-2xl font-extrabold text-primary-500">${price.toLocaleString()}</p>
            </div>
          </motion.div>

          {/* Book Flight */}
          <motion.a
            variants={itemVariants}
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold transition-colors"
          >
            Book Flight
          </motion.a>
        </div>
      </motion.div>
    );
  }
);

FlightCard.displayName = 'FlightCard';

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="font-semibold text-card-foreground">{value}</span>
  </div>
);

import { sortPostsByDate } from "@/lib/utils";
import { Post, PostCategory } from "@/types";

export const blogData: Record<PostCategory, Post[]> = {
  travel: [
    {
      key: "travel-01",
      title:
        "Wanderlust Unleashed: 10 Must-Visit Destinations for Solo Travelers",
      slug: "wanderlust-unleashed-10-must-visit-destinations-for-solo-travelers",
      image: "/images/travel-01.jpg",
      postDate: new Date("2025-02-25"),
      description:
        "Discover the top destinations perfect for solo adventurers seeking independence and self-discovery.",
    },
    {
      key: "travel-03",
      title: "The Art of Slow Travel: Savoring Every Moment Abroad",
      slug: "the-art-of-slow-travel-savoring-every-moment-abroad",
      image: "/images/travel-03.jpg",
      postDate: new Date("2025-02-21"),
      description:
        "Learn how to embrace slow travel and create more meaningful connections with the places you visit.",
    },
    {
      key: "travel-04",
      title: "Digital Nomad Lifestyle: Working While Exploring the World",
      slug: "digital-nomad-lifestyle-working-while-exploring-the-world",
      image: "/images/travel-04.jpg",
      postDate: new Date("2025-02-20"),
      description:
        "Everything you need to know about balancing work and travel as a digital nomad.",
    },
    {
      key: "travel-05",
      title: "Hidden Gems: Off-the-Beaten-Path Travel Destinations",
      slug: "hidden-gems-off-the-beaten-path-travel-destinations",
      image: "/images/travel-05.jpg",
      postDate: new Date("2025-02-16"),
      description:
        "Explore lesser-known destinations that offer unique experiences away from tourist crowds.",
    },
    {
      key: "travel-06",
      title: "Traveling on a Budget: Tips and Tricks for Affordable Adventures",
      slug: "traveling-on-a-budget-tips-and-tricks-for-affordable-adventures",
      image: "/images/travel-06.jpg",
      postDate: new Date("2025-02-16"),
      description:
        "Smart strategies to make your travel dreams come true without breaking the bank.",
    },
    {
      key: "travel-07",
      title: "Culinary Adventures: Exploring Global Cuisine on Your Travels",
      slug: "culinary-adventures-exploring-global-cuisine-on-your-travels",
      image: "/images/travel-07.jpg",
      postDate: new Date("2025-02-13"),
      description:
        "A food lover's guide to discovering authentic local flavors around the world.",
    },
    {
      key: "travel-08",
      title: "Packing Hacks: How to Travel Light and Stress-Free",
      slug: "packing-hacks-how-to-travel-light-and-stress-free",
      image: "/images/travel-08.jpg",
      postDate: new Date("2025-02-13"),
      description:
        "Expert tips to pack efficiently and make your journeys more comfortable.",
    },
    {
      key: "travel-09",
      title: "Adventure Travel: Thrill-Seeker's Guide to Extreme Experiences",
      slug: "adventure-travel-thrill-seekers-guide-to-extreme-experiences",
      image: "/images/travel-09.jpg",
      postDate: new Date("2025-02-13"),
      description:
        "Expert tips to pack efficiently and make your journeys more comfortable.",
    },
    {
      key: "travel-10",
      title: "Solo Female Travel: Empowering Journeys and Safety Tips",
      slug: "solo-female-travel-empowering-journeys-and-safety-tips",
      image: "/images/travel-10.jpg",
      postDate: new Date("2025-02-08"),
      description:
        "Essential advice for women traveling alone to ensure safe and empowering experiences.",
    },
  ],
  lifestyle: [
    {
      key: "lifestyle-01",
      title: "Mental Health Matters: Traveling and Coping with Anxiety",
      slug: "mental-health-matters-traveling-and-coping-with-anxiety",
      image: "/images/lifestyle-01.jpg",
      postDate: new Date("2025-02-27"),
      description:
        "Strategies to manage anxiety while traveling and maintain mental wellness on the road.",
    },
    {
      key: "lifestyle-02",
      title: "Mindful Living: Finding Peace and Serenity in Everyday Chaos",
      slug: "mindful-living-finding-peace-and-serenity-in-everyday-chaos",
      image: "/images/lifestyle-02.jpg",
      postDate: new Date("2025-02-12"),
      description:
        "Practical mindfulness techniques to bring calm and presence to your daily life.",
    },
    {
      key: "lifestyle-03",
      title: "Sustainable Living: Eco-Friendly Choices for a Greener Life",
      slug: "sustainable-living-eco-friendly-choices-for-a-greener-life",
      image: "/images/lifestyle-03.jpg",
      postDate: new Date("2025-02-12"),
      description:
        "Simple changes you can make to reduce your environmental impact and live more sustainably.",
    },
    {
      key: "lifestyle-04",
      title: "The Art of Hygge: Cozy Living in a Fast-Paced World",
      slug: "the-art-of-hygge-cozy-living-in-a-fast-paced-world",
      image: "/images/lifestyle-04.jpg",
      postDate: new Date("2025-02-11"),
      description:
        "Embrace the Danish concept of hygge to create warmth, comfort, and contentment in your home.",
    },
    // {
    //   key: "lifestyle-05",
    //   title: "Adventure Travel: Thrill-Seeker's Guide to Extreme Experiences 2",
    //   slug: "adventure-travel-thrill-seeker-s-guide-to-extreme-experiences-2",
    //   image: "/images/lifestyle-05.jpg",
    //   postDate: new Date("2025-02-09"),
    //   description:
    //     "Part two of our guide to the world's most exhilarating adventure travel experiences.",
    // },
    {
      key: "lifestyle-05",
      title: "Adventure Travel: Thrill-Seeker's Guide to Extreme Experiences",
      slug: "adventure-travel-thrill-seeker-s-guide-to-extreme-experiences",
      image: "/images/lifestyle-05.jpg",
      postDate: new Date("2025-02-08"),
      description:
        "Discover heart-pounding adventures for those who crave excitement and challenge.",
    },
    {
      key: "lifestyle-06",
      title:
        "Northern Lights Adventures: Chasing Aurora Borealis in Scandinavia",
      slug: "northern-lights-adventures-chasing-aurora-borealis-in-scandinavia",
      image: "/images/lifestyle-06.jpg",
      postDate: new Date("2025-02-08"),
      description:
        "Your complete guide to witnessing the magical Northern Lights in Scandinavia.",
    },
    {
      key: "lifestyle-07",
      title: "Digital Detox Retreats: Reconnect with Nature and Yourself",
      slug: "digital-detox-retreats-reconnect-with-nature-and-yourself",
      image: "/images/lifestyle-07.jpg",
      postDate: new Date("2025-02-06"),
      description:
        "Discover retreats that help you unplug from technology and reconnect with the natural world.",
    },
    {
      key: "lifestyle-08",
      title: "Traveling with Pets: Tips for a Stress-Free Journey",
      slug: "traveling-with-pets-tips-for-a-stress-free-journey",
      image: "/images/lifestyle-08.jpg",
      postDate: new Date("2025-02-06"),
      description:
        "Essential advice for making travel with your furry companions safe and enjoyable.",
    },
    {
      key: "lifestyle-09",
      title: "Minimalist Lifestyle: Decluttering Your Life for More Freedom",
      slug: "minimalist-lifestyle-decluttering-your-life-for-more-freedom",
      image: "/images/lifestyle-09.jpg",
      postDate: new Date("2025-02-06"),
      description:
        "How embracing minimalism can create space for what truly matters in your life.",
    },
    {
      key: "lifestyle-10",
      title: "Healthy Habits for Travelers: Staying Fit on the Road",
      slug: "healthy-habits-for-travelers-staying-fit-on-the-road",
      image: "/images/lifestyle-10.jpg",
      postDate: new Date("2025-02-06"),
      description:
        "Practical tips to maintain your health and wellness while traveling.",
    },
  ],
  destination: [
    {
      key: "destination-01",
      title:
        "North America Road Trip: From Coast to Coast, Scenic Routes Await",
      slug: "north-america-road-trip-from-coast-to-coast-scenic-routes-await",
      image: "/images/destination-01.jpg",
      postDate: new Date("2025-02-25"),
      description:
        "Explore the diverse landscapes and cultures of North America on an epic road trip adventure.",
    },
    {
      key: "destination-02",
      title: "Australia and New Zealand: Down Under Delights and Adventures",
      slug: "australia-and-new-zealand-down-under-delights-and-adventures",
      image: "/images/destination-02.jpg",
      postDate: new Date("2025-02-25"),
      description:
        "Discover the natural wonders and unique experiences awaiting in Australia and New Zealand.",
    },
    {
      key: "destination-03",
      title: "Exploring Europe's Cultural Tapestry: Must-See Cities and Towns",
      slug: "exploring-europe-s-cultural-tapestry-must-see-cities-and-towns",
      image: "/images/destination-03.jpg",
      postDate: new Date("2025-02-21"),
      description:
        "Immerse yourself in Europe's rich history, architecture, and diverse cultural heritage.",
    },
    {
      key: "destination-04",
      title: "South American Escapades: From Machu Picchu to the Amazon",
      slug: "south-american-escapades-from-machu-picchu-to-the-amazon",
      image: "/images/destination-04.jpg",
      postDate: new Date("2025-02-19"),
      description:
        "Journey through South America's most iconic landscapes and ancient civilizations.",
    },
    {
      key: "destination-05",
      title: "Middle Eastern Marvels: Ancient History and Modern Splendor",
      slug: "middle-eastern-marvels-ancient-history-and-modern-splendor",
      image: "/images/destination-05.jpg",
      postDate: new Date("2025-02-10"),
      description:
        "Explore the fascinating blend of ancient traditions and contemporary innovation in the Middle East.",
    },
    {
      key: "destination-06",
      title: "Island Paradise: Your Guide to Tropical Getaways in the Maldives",
      slug: "island-paradise-your-guide-to-tropical-getaways-in-the-maldives",
      image: "/images/destination-06.jpg",
      postDate: new Date("2025-02-10"),
      description:
        "Experience ultimate luxury and natural beauty in the stunning Maldives archipelago.",
    },
    {
      key: "destination-07",
      title: "Caribbean Dreams: Sun, Sand, and Sea on a Tropical Escape",
      slug: "caribbean-dreams-sun-sand-and-sea-on-a-tropical-escape",
      image: "/images/destination-07.jpg",
      postDate: new Date("2025-02-08"),
      description:
        "Your comprehensive guide to planning the perfect Caribbean vacation.",
    },
    {
      key: "destination-08",
      title: "African Safari: Wildlife Encounters in the Heart of the Savanna",
      slug: "african-safari-wildlife-encounters-in-the-heart-of-the-savanna",
      image: "/images/destination-08.jpg",
      postDate: new Date("2025-02-06"),
      description:
        "Embark on an unforgettable safari adventure to witness Africa's incredible wildlife.",
    },
    {
      key: "destination-09",
      title:
        "The Wonders of Asia: Unforgettable Adventures Across the Continent",
      slug: "the-wonders-of-asia-unforgettable-adventures-across-the-continent",
      image: "/images/destination-09.jpg",
      postDate: new Date("2025-02-06"),
      description:
        "Discover the diverse cultures, landscapes, and experiences that make Asia a traveler's paradise.",
    },
  ],
};

export const descriptions = {
  travel:
    "In our Travel category, we embark on a journey of exploration, sharing personal experiences, tips, and stories from globetrotters passionate about traversing the world's diverse landscapes and cultures.",
  lifestyle:
    "Discover the essence of a traveler's lifestyle in this category, where we delve into personal stories, insights, and recommendations from a seasoned globetrotter's perspective. Explore the world of travel, fashion, cuisine, and more through the lens of a dedicated explorer.",
  destination:
    "Explore the essence of a traveler's lifestyle in our Destination category, where we delve into personal stories, insights, and recommendations from a seasoned globetrotter's perspective. Discover the world of travel, fashion, cuisine, and more through the lens of a dedicated explorer.",
};

export const blogs: Post[] = sortPostsByDate([
  ...blogData.travel,
  ...blogData.lifestyle,
  ...blogData.destination,
]);

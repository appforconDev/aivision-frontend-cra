import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { Button } from "components/ui/button";

interface FiltersProps {
  onCountryChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onSortChange: (value: "asc" | "desc") => void;
  initialCountry: string;
  initialGenre: string;
  initialSort: "asc" | "desc";
}

const Filters: React.FC<FiltersProps> = ({
  onCountryChange,
  onGenreChange,
  onSortChange,
  initialCountry,
  initialGenre,
  initialSort,
}) => {
  const [country, setCountry] = useState(initialCountry);
  const [genre, setGenre] = useState(initialGenre);
  const [sortByPoints, setSortByPoints] = useState(initialSort);

  useEffect(() => {
    setCountry(initialCountry);
    setGenre(initialGenre);
    setSortByPoints(initialSort);
  }, [initialCountry, initialGenre, initialSort]);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Select value={country} onValueChange={(value) => {
        setCountry(value);
        onCountryChange(value);
      }}>
        <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
          <SelectValue placeholder="Filter by country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries</SelectItem>
          <SelectItem value="Albania">Albania</SelectItem>
          <SelectItem value="Armenia">Armenia</SelectItem>
          <SelectItem value="Australia">Australia</SelectItem>
          <SelectItem value="Austria">Austria</SelectItem>
          <SelectItem value="Azerbaijan">Azerbaijan</SelectItem>
          <SelectItem value="Belgium">Belgium</SelectItem>
          <SelectItem value="Croatia">Croatia</SelectItem>
          <SelectItem value="Cyprus">Cyprus</SelectItem>
          <SelectItem value="Czechia">Czechia</SelectItem>
          <SelectItem value="Denmark">Denmark</SelectItem>
          <SelectItem value="Estonia">Estonia</SelectItem>
          <SelectItem value="Finland">Finland</SelectItem>
          <SelectItem value="France">France</SelectItem>
          <SelectItem value="Georgia">Georgia</SelectItem>
          <SelectItem value="Germany">Germany</SelectItem>
          <SelectItem value="Greece">Greece</SelectItem>
          <SelectItem value="Iceland">Iceland</SelectItem>
          <SelectItem value="Ireland">Ireland</SelectItem>
          <SelectItem value="Israel">Israel</SelectItem>
          <SelectItem value="Italy">Italy</SelectItem>
          <SelectItem value="Latvia">Latvia</SelectItem>
          <SelectItem value="Lithuania">Lithuania</SelectItem>
          <SelectItem value="Luxembourg">Luxembourg</SelectItem>
          <SelectItem value="Malta">Malta</SelectItem>
          <SelectItem value="Montenegro">Montenegro</SelectItem>
          <SelectItem value="Netherlands">Netherlands</SelectItem>
          <SelectItem value="Norway">Norway</SelectItem>
          <SelectItem value="Poland">Poland</SelectItem>
          <SelectItem value="Portugal">Portugal</SelectItem>
          <SelectItem value="San Marino">San Marino</SelectItem>
          <SelectItem value="Serbia">Serbia</SelectItem>
          <SelectItem value="Slovenia">Slovenia</SelectItem>
          <SelectItem value="Spain">Spain</SelectItem>
          <SelectItem value="Sweden">Sweden</SelectItem>
          <SelectItem value="Switzerland">Switzerland</SelectItem>
          <SelectItem value="Ukraine">Ukraine</SelectItem>
          <SelectItem value="United Kingdom">United Kingdom</SelectItem>
        </SelectContent>
      </Select>

      <Select value={genre} onValueChange={(value) => {
        setGenre(value);
        onGenreChange(value);
      }}>
        <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
          <SelectValue placeholder="Filter by genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Genres</SelectItem>
          <SelectItem value="Pop">Pop</SelectItem>
          <SelectItem value="Rock">Rock</SelectItem>
          <SelectItem value="Ballad">Ballad</SelectItem>
          <SelectItem value="Electronic">Electronic</SelectItem>
          <SelectItem value="Jazz">Jazz</SelectItem>
          <SelectItem value="Classical">Classical</SelectItem>
          <SelectItem value="Country">Country</SelectItem>
          <SelectItem value="Blues">Blues</SelectItem>
          <SelectItem value="Reggae">Reggae</SelectItem>
          <SelectItem value="Metal">Metal</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() => {
          const newSort = sortByPoints === "asc" ? "desc" : "asc";
          setSortByPoints(newSort);
          onSortChange(newSort);
        }}
        className="border-white/10"
      >
        Points {sortByPoints === "asc" ? "▲" : "▼"}
      </Button>
    </div>
  );
};

export default Filters;

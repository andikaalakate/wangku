-- Create tables for WangKu

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  current_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('completed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  estimated_cost NUMERIC NOT NULL,
  priority INTEGER DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('completed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own wishlists" ON wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlists" ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wishlists" ON wishlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlists" ON wishlists FOR DELETE USING (auth.uid() = user_id);

-- Function to update profile balance
CREATE OR REPLACE FUNCTION update_profile_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Reverse the effect of the OLD record if it was completed
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
        IF (OLD.status = 'completed') THEN
            UPDATE profiles
            SET current_balance = CASE
                WHEN OLD.type = 'income' THEN current_balance - OLD.amount
                WHEN OLD.type = 'expense' THEN current_balance + OLD.amount
                ELSE current_balance
            END
            WHERE id = OLD.user_id;
        END IF;
    END IF;

    -- 2. Apply the effect of the NEW record if it is completed
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF (NEW.status = 'completed') THEN
            UPDATE profiles
            SET current_balance = CASE
                WHEN NEW.type = 'income' THEN current_balance + NEW.amount
                WHEN NEW.type = 'expense' THEN current_balance - NEW.amount
                ELSE current_balance
            END
            WHERE id = NEW.user_id;
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run the function
CREATE TRIGGER on_transaction_change
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_profile_balance();
